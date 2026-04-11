import random
import string
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from models import (
    PatientCase, Appointment, ClinicSlot, CompletionProof,
    CareStatus, AppointmentStatus, SlotStatus
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


def book_appointment(access_code: str, slot_id: str, db: Session) -> Appointment:
    """
    Book an available slot for a patient case.

    Raises:
        ValueError: if access_code invalid, case already has appointment,
                    slot not found, or slot not available.
    """
    case = get_case_by_access_code(access_code, db)
    if not case:
        raise ValueError("Access code not found")

    if case.appointment:
        raise ValueError("This case already has an appointment. Cancel it first to rebook.")

    slot = db.query(ClinicSlot).filter(ClinicSlot.id == slot_id).first()
    if not slot:
        raise ValueError("Slot not found")
    if slot.status != SlotStatus.AVAILABLE:
        raise ValueError(f"Slot is not available (status: {slot.status})")

    slot.status = SlotStatus.BOOKED
    appointment = Appointment(
        patient_case_id=case.id,
        clinic_slot_id=slot_id,
        status=AppointmentStatus.PENDING,
    )
    db.add(appointment)

    case.care_status = CareStatus.APPOINTMENT_REQUESTED
    db.commit()
    db.refresh(appointment)

    print(
        f"[APPOINTMENT_BOOKED] appointment_id={appointment.id} "
        f"patient_case_id={case.id} slot_id={slot_id}"
    )

    return appointment


def cancel_appointment(access_code: str, db: Session) -> Appointment:
    """
    Cancel an existing appointment.
    Frees the slot back to AVAILABLE.

    Raises:
        ValueError: if access_code invalid or no appointment to cancel.
    """
    case = get_case_by_access_code(access_code, db)
    if not case:
        raise ValueError("Access code not found")
    if not case.appointment:
        raise ValueError("No appointment to cancel")

    appointment = case.appointment
    if appointment.status in (AppointmentStatus.COMPLETED,):
        raise ValueError("Cannot cancel a completed appointment")

    slot = appointment.slot
    slot.status = SlotStatus.AVAILABLE
    appointment.status = AppointmentStatus.CANCELLED_BY_USER
    appointment.updated_at = datetime.now(timezone.utc)
    case.care_status = CareStatus.CREATED

    db.commit()
    db.refresh(appointment)
    return appointment


def reschedule_appointment(access_code: str, new_slot_id: str, db: Session) -> Appointment:
    """
    Reschedule to a new slot.
    Frees old slot, books new slot.

    Raises:
        ValueError: if any precondition fails.
    """
    case = get_case_by_access_code(access_code, db)
    if not case:
        raise ValueError("Access code not found")
    if not case.appointment:
        raise ValueError("No appointment to reschedule")

    appointment = case.appointment
    if appointment.status == AppointmentStatus.COMPLETED:
        raise ValueError("Cannot reschedule a completed appointment")

    new_slot = db.query(ClinicSlot).filter(ClinicSlot.id == new_slot_id).first()
    if not new_slot:
        raise ValueError("New slot not found")
    if new_slot.status != SlotStatus.AVAILABLE:
        raise ValueError(f"New slot is not available (status: {new_slot.status})")

    old_slot = appointment.slot
    old_slot.status = SlotStatus.AVAILABLE

    new_slot.status = SlotStatus.BOOKED
    appointment.clinic_slot_id = new_slot_id
    appointment.status = AppointmentStatus.RESCHEDULED
    appointment.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(appointment)
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
    if appointment.status == AppointmentStatus.COMPLETED:
        raise ValueError("Appointment already completed")
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
    patient_case.care_status = CareStatus.PROOF_SUBMITTED

    db.commit()
    db.refresh(proof)

    if appointment.funding_case_id:
        from models import Voucher

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