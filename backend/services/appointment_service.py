import random
import string
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models import (
    PatientCase,
    Appointment,
    ClinicSlot,
    CompletionProof,
    CareStatus,
    AppointmentStatus,
    SlotStatus,
    Voucher,
)
from services.voucher_service import confirm_service_and_release


def generate_access_code() -> str:
    """Generate 8-character uppercase alphanumeric access code."""
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=8))


def create_patient_case(email: str, phone: Optional[str], country_of_origin: str, db: Session) -> PatientCase:
    """
    Create a new patient case with a unique access code.
    access_code is shown to the user once and used for all subsequent lookups.
    """
    code = None
    for _ in range(5):
        candidate = generate_access_code()
        existing = db.query(PatientCase).filter(PatientCase.access_code == candidate).first()
        if not existing:
            code = candidate
            break

    if code is None:
        raise Exception("Failed to generate a unique access code")

    case = PatientCase(
        email=email,
        phone=phone,
        country_of_origin=country_of_origin,
        access_code=code,
        care_status=CareStatus.CREATED,
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    print(
        f"[CASE_CREATED] case_id={case.id} access_code={case.access_code} "
        f"country={case.country_of_origin} email={case.email}"
    )

    return case


def get_case_by_access_code(access_code: str, db: Session) -> Optional[PatientCase]:
    return db.query(PatientCase).filter(PatientCase.access_code == access_code).first()


def _get_active_appointment_for_case(case: PatientCase) -> Optional[Appointment]:
    """
    Return the current active appointment for a case.
    Cancelled appointments are not considered active.
    """
    appointment = case.appointment
    if not appointment:
        return None

    if appointment.status in (
        AppointmentStatus.CANCELLED_BY_USER,
        AppointmentStatus.CANCELLED_BY_CLINIC,
    ):
        return None

    return appointment


def book_appointment(access_code: str, slot_id: str, db: Session) -> Appointment:
    """
    Book an available slot for a patient case.

    Rules:
    - A case may have only one appointment row in the current schema.
    - If the case has a cancelled appointment, we reuse that row.
    - If the case has an active appointment, booking is rejected.
    """
    case = get_case_by_access_code(access_code, db)
    if not case:
        raise ValueError("Access code not found")

    if case.care_status == CareStatus.PAYMENT_RELEASED:
        raise ValueError("This case is already completed and paid")

    slot = db.query(ClinicSlot).filter(ClinicSlot.id == slot_id).first()
    if not slot:
        raise ValueError("Slot not found")

    if slot.status != SlotStatus.AVAILABLE:
        raise ValueError(f"Slot is not available (status: {slot.status})")

    appointment = case.appointment

    if appointment:
        if appointment.status in (
            AppointmentStatus.CANCELLED_BY_USER,
            AppointmentStatus.CANCELLED_BY_CLINIC,
        ):
            old_slot = appointment.slot
            if old_slot and old_slot.id != slot.id and old_slot.status == SlotStatus.BOOKED:
                old_slot.status = SlotStatus.AVAILABLE

            appointment.clinic_slot_id = slot.id
            appointment.status = AppointmentStatus.PENDING
            appointment.updated_at = datetime.now(timezone.utc)
        else:
            raise ValueError("This case already has an active appointment. Cancel it first to rebook.")
    else:
        appointment = Appointment(
            patient_case_id=case.id,
            clinic_slot_id=slot.id,
            status=AppointmentStatus.PENDING,
        )
        db.add(appointment)

    slot.status = SlotStatus.BOOKED
    case.care_status = CareStatus.APPOINTMENT_REQUESTED

    db.commit()
    db.refresh(appointment)

    print(
        f"[APPOINTMENT_BOOKED] appointment_id={appointment.id} "
        f"patient_case_id={case.id} slot_id={slot.id}"
    )

    return appointment


def cancel_appointment(access_code: str, appointment_id: str, db: Session) -> Appointment:
    """
    Cancel an existing appointment.
    Frees the slot back to AVAILABLE.

    Raises:
        ValueError: if access_code invalid, appointment not found, or appointment not cancellable.
    """
    case = get_case_by_access_code(access_code, db)
    if not case:
        raise ValueError("Access code not found")

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise ValueError("Appointment not found")

    if appointment.patient_case_id != case.id:
        raise ValueError("This appointment does not belong to the provided access code")

    if appointment.status in (
        AppointmentStatus.CANCELLED_BY_USER,
        AppointmentStatus.CANCELLED_BY_CLINIC,
    ):
        raise ValueError("Appointment is already cancelled")

    if appointment.status == AppointmentStatus.COMPLETED:
        raise ValueError("Cannot cancel a completed appointment")

    slot = appointment.slot
    if not slot:
        raise ValueError("Appointment slot not found")

    slot.status = SlotStatus.AVAILABLE
    appointment.status = AppointmentStatus.CANCELLED_BY_USER
    appointment.updated_at = datetime.now(timezone.utc)

    if case.care_status != CareStatus.PAYMENT_RELEASED:
        case.care_status = CareStatus.CREATED

    db.commit()
    db.refresh(appointment)

    print(
        f"[APPOINTMENT_CANCELLED] appointment_id={appointment.id} "
        f"patient_case_id={case.id} slot_id={slot.id}"
    )

    return appointment


def reschedule_appointment(access_code: str, appointment_id: str, new_slot_id: str, db: Session) -> Appointment:
    """
    Reschedule an appointment to a new slot.

    Raises:
        ValueError: if any precondition fails.
    """
    case = get_case_by_access_code(access_code, db)
    if not case:
        raise ValueError("Access code not found")

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise ValueError("Appointment not found")

    if appointment.patient_case_id != case.id:
        raise ValueError("This appointment does not belong to the provided access code")

    if appointment.status in (
        AppointmentStatus.CANCELLED_BY_USER,
        AppointmentStatus.CANCELLED_BY_CLINIC,
    ):
        raise ValueError("Cannot reschedule a cancelled appointment")

    if appointment.status == AppointmentStatus.COMPLETED:
        raise ValueError("Cannot reschedule a completed appointment")

    new_slot = db.query(ClinicSlot).filter(ClinicSlot.id == new_slot_id).first()
    if not new_slot:
        raise ValueError("New slot not found")

    if new_slot.status != SlotStatus.AVAILABLE:
        raise ValueError(f"New slot is not available (status: {new_slot.status})")

    old_slot = appointment.slot
    if not old_slot:
        raise ValueError("Current appointment slot not found")

    if old_slot.id == new_slot.id:
        raise ValueError("New slot must be different from current slot")

    old_slot.status = SlotStatus.AVAILABLE
    new_slot.status = SlotStatus.BOOKED

    appointment.clinic_slot_id = new_slot_id
    appointment.status = AppointmentStatus.PENDING
    appointment.updated_at = datetime.now(timezone.utc)

    if case.care_status != CareStatus.PAYMENT_RELEASED:
        case.care_status = CareStatus.APPOINTMENT_REQUESTED

    db.commit()
    db.refresh(appointment)

    print(
        f"[APPOINTMENT_RESCHEDULED] appointment_id={appointment.id} "
        f"patient_case_id={case.id} old_slot_id={old_slot.id} new_slot_id={new_slot.id}"
    )

    return appointment


def submit_completion_proof(
    appointment_id: str,
    rpps_invoice_number: str,
    total_cost_eur: int,
    pdf_filename: Optional[str],
    db: Session,
) -> CompletionProof:
    """
    Submit completion proof for an appointment.

    If appointment has a linked funding_case with a valid voucher,
    triggers escrow release immediately.
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise ValueError("Appointment not found")

    if appointment.status in (
        AppointmentStatus.CANCELLED_BY_USER,
        AppointmentStatus.CANCELLED_BY_CLINIC,
    ):
        raise ValueError("Cannot submit proof for a cancelled appointment")

    if appointment.status == AppointmentStatus.COMPLETED:
        raise ValueError("Appointment already completed")
    
    if appointment.status != AppointmentStatus.CONFIRMED:
        raise ValueError("Proof can only be submitted for confirmed appointments")

    if appointment.proof:
        raise ValueError("Proof already submitted for this appointment")

    proof = CompletionProof(
        appointment_id=appointment_id,
        rpps_invoice_number=rpps_invoice_number,
        total_cost_eur=total_cost_eur,
        pdf_filename=pdf_filename,
    )
    db.add(proof)

    appointment.status = AppointmentStatus.COMPLETED
    appointment.updated_at = datetime.now(timezone.utc)

    patient_case = appointment.patient_case
    if patient_case:
        patient_case.care_status = CareStatus.PROOF_SUBMITTED

    db.commit()
    db.refresh(proof)

    if appointment.funding_case_id:
        voucher = db.query(Voucher).filter(
            Voucher.funding_case_id == appointment.funding_case_id
        ).first()

        if voucher and voucher.status.value == "unused":
            try:
                print(
                    f"[ESCROW_RELEASE_STARTED] proof_id={proof.id} "
                    f"funding_case_id={appointment.funding_case_id} voucher_id={voucher.id}"
                )

                result = confirm_service_and_release(voucher.id, db)

                proof.escrow_tx_hash = result["tx_hash"]
                if patient_case:
                    patient_case.care_status = CareStatus.PAYMENT_RELEASED
                db.commit()
                db.refresh(proof)

                print(
                    f"[ESCROW_RELEASE_SUCCESS] proof_id={proof.id} "
                    f"funding_case_id={appointment.funding_case_id} tx_hash={result['tx_hash']}"
                )
            except Exception as e:
                print(
                    f"[ESCROW_RELEASE_FAILED] proof_id={proof.id} "
                    f"funding_case_id={appointment.funding_case_id} error={e}"
                )

    return proof