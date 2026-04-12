from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
import random
import string

from models import (
    FundingCase,
    CaseStatus,
    Clinic,
    ClinicSlot,
    SlotStatus,
    Appointment,
    AppointmentStatus,
)
from services.xrpl_service import (
    compute_patient_hash,
    generate_condition,
    create_escrow,
    finish_escrow,
    get_funder_wallet,
)


def generate_access_code(db: Session, length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits

    while True:
        candidate = "".join(random.choices(alphabet, k=length))
        exists = db.query(FundingCase).filter(FundingCase.access_code == candidate).first()
        if not exists:
            return candidate

# --------------------
# Clinic / Slot
# --------------------

def register_clinic(
    name: str,
    doctor_name: str,
    address: str,
    city: str,
    xrpl_wallet_address: Optional[str],
    db: Session,
) -> Clinic:
    existing = db.query(Clinic).filter(
        Clinic.name == name,
        Clinic.doctor_name == doctor_name,
        Clinic.address == address,
        Clinic.city == city,
    ).first()
    if existing:
        raise ValueError("Clinic already exists")

    clinic = Clinic(
        name=name,
        doctor_name=doctor_name,
        address=address,
        city=city,
        xrpl_wallet_address=xrpl_wallet_address,
    )
    db.add(clinic)
    db.commit()
    db.refresh(clinic)
    return clinic


def create_slot(clinic_id: str, slot_datetime: datetime, db: Session) -> ClinicSlot:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic:
        raise ValueError("Clinic not found")

    existing = db.query(ClinicSlot).filter(
        ClinicSlot.clinic_id == clinic_id,
        ClinicSlot.slot_datetime == slot_datetime,
    ).first()
    if existing:
        raise ValueError("Slot already exists for this clinic and time")

    slot = ClinicSlot(
        clinic_id=clinic_id,
        slot_datetime=slot_datetime,
        status=SlotStatus.AVAILABLE,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


def delete_slot(clinic_id: str, slot_id: str, db: Session) -> None:
    slot = db.query(ClinicSlot).filter(ClinicSlot.id == slot_id).first()
    if not slot:
        raise ValueError("Slot not found")

    if slot.clinic_id != clinic_id:
        raise ValueError("Slot does not belong to this clinic")

    if slot.status != SlotStatus.AVAILABLE:
        raise ValueError(f"Only available slots can be deleted (status: {slot.status})")

    db.delete(slot)
    db.commit()


def list_clinics_with_available_slots(db: Session) -> list[Clinic]:
    return db.query(Clinic).all()


# --------------------
# Case + Appointment
# --------------------

def create_case_with_appointment(
    name: str,
    date_of_birth: str,
    insurance_number: str,
    slot_id: str,
    email: str,
    country: Optional[str],
    amount_xrp: int,
    db: Session,
) -> tuple[FundingCase, Appointment]:
    patient_hash = compute_patient_hash(name, date_of_birth, insurance_number)

    existing_active = db.query(FundingCase).filter(
        FundingCase.patient_hash == patient_hash,
        FundingCase.status == CaseStatus.ACTIVE,
    ).first()
    if existing_active:
        raise ValueError(
            "An active funding case already exists for this patient. "
            "You cannot have two active cases at the same time."
        )

    slot = db.query(ClinicSlot).filter(ClinicSlot.id == slot_id).first()
    if not slot:
        raise ValueError("Slot not found")

    if slot.status != SlotStatus.AVAILABLE:
        raise ValueError(f"Slot is not available (status: {slot.status})")

    amount_drops = amount_xrp * 1_000_000
    access_code = generate_access_code(db)

    case = FundingCase(
        patient_hash=patient_hash,
        access_code=access_code,
        email=email,
        country=country,
        clinic_address=slot.clinic.xrpl_wallet_address or "",
        amount_xrp=amount_xrp,
        amount_drops=amount_drops,
        status=CaseStatus.PENDING,
    )
    db.add(case)
    db.flush()

    appointment = Appointment(
        funding_case_id=case.id,
        clinic_slot_id=slot.id,
        status=AppointmentStatus.BOOKED,
    )
    db.add(appointment)

    slot.status = SlotStatus.BOOKED

    db.commit()
    db.refresh(case)
    db.refresh(appointment)
    return case, appointment


def cancel_appointment(appointment_id: str, access_code: str, db: Session) -> Appointment:
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise ValueError("Appointment not found")

    if appointment.status == AppointmentStatus.COMPLETED:
        raise ValueError("Cannot cancel a completed appointment")

    if appointment.status in (
        AppointmentStatus.CANCELLED_BY_USER,
        AppointmentStatus.CANCELLED_BY_CLINIC,
    ):
        raise ValueError("Appointment is already cancelled")

    case = appointment.funding_case
    if case.access_code != access_code:
        raise ValueError("Invalid access code")
    if case.status == CaseStatus.RELEASED:
        raise ValueError("Cannot cancel an appointment for a released case")

    slot = appointment.slot
    if slot and slot.status != SlotStatus.CANCELLED:
        slot.status = SlotStatus.AVAILABLE

    appointment.status = AppointmentStatus.CANCELLED_BY_USER
    appointment.updated_at = datetime.now(timezone.utc)

    if case.status != CaseStatus.RELEASED:
        case.status = CaseStatus.CANCELLED

    db.commit()
    db.refresh(appointment)
    return appointment


def reschedule_appointment(appointment_id: str, access_code: str, new_slot_id: str, db: Session) -> Appointment:
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise ValueError("Appointment not found")

    if appointment.status == AppointmentStatus.COMPLETED:
        raise ValueError("Cannot reschedule a completed appointment")

    if appointment.status in (
        AppointmentStatus.CANCELLED_BY_USER,
        AppointmentStatus.CANCELLED_BY_CLINIC,
    ):
        raise ValueError("Cannot reschedule a cancelled appointment")

    case = appointment.funding_case
    if case.access_code != access_code:
        raise ValueError("Invalid access code")
    if case.status == CaseStatus.RELEASED:
        raise ValueError("Cannot reschedule an appointment for a released case")

    new_slot = db.query(ClinicSlot).filter(ClinicSlot.id == new_slot_id).first()
    if not new_slot:
        raise ValueError("New slot not found")

    if new_slot.status != SlotStatus.AVAILABLE:
        raise ValueError(f"New slot is not available (status: {new_slot.status})")

    old_slot = appointment.slot
    if old_slot.id == new_slot.id:
        raise ValueError("New slot must be different from current slot")

    if old_slot.status != SlotStatus.CANCELLED:
        old_slot.status = SlotStatus.AVAILABLE

    new_slot.status = SlotStatus.BOOKED
    appointment.clinic_slot_id = new_slot.id
    appointment.status = AppointmentStatus.BOOKED
    appointment.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(appointment)
    return appointment


# --------------------
# Funding
# --------------------

def create_escrow_for_case(case_id: str, db: Session) -> FundingCase:
    case = db.query(FundingCase).filter(FundingCase.id == case_id).first()
    if not case:
        raise ValueError("Case not found")

    if case.status != CaseStatus.PENDING:
        raise ValueError(f"Case is not pending (status: {case.status})")

    appointment = case.appointment
    if not appointment:
        raise ValueError("Case does not have an appointment")

    if appointment.status != AppointmentStatus.BOOKED:
        raise ValueError(f"Appointment is not bookable for funding (status: {appointment.status})")

    funder = get_funder_wallet()
    condition_pair = generate_condition()

    result = create_escrow(
        amount_drops=case.amount_drops,
        condition_hex=condition_pair["condition_hex"],
        patient_hash=case.patient_hash,
    )

    case.funder_address = funder.address
    case.fulfillment_hex = condition_pair["fulfillment_hex"]
    case.condition_hex = condition_pair["condition_hex"]
    case.tx_hash_create = result["tx_hash"]
    case.escrow_sequence = result["sequence"]
    case.status = CaseStatus.ACTIVE

    db.commit()
    db.refresh(case)
    return case


# --------------------
# Clinic verify + release
# --------------------

def verify_and_release(
    name: str,
    date_of_birth: str,
    insurance_number: str,
    db: Session,
) -> dict:
    patient_hash = compute_patient_hash(name, date_of_birth, insurance_number)

    case = db.query(FundingCase).filter(
        FundingCase.patient_hash == patient_hash,
        FundingCase.status == CaseStatus.ACTIVE,
    ).first()

    if not case:
        return {
            "matched": False,
            "case_id": None,
            "appointment_id": None,
            "tx_hash": None,
            "amount_xrp": None,
            "message": "No active funding found for this identity.",
        }

    appointment = case.appointment
    if not appointment:
        return {
            "matched": False,
            "case_id": None,
            "appointment_id": None,
            "tx_hash": None,
            "amount_xrp": None,
            "message": "No appointment found for this active funding case.",
        }

    if appointment.status != AppointmentStatus.BOOKED:
        return {
            "matched": False,
            "case_id": case.id,
            "appointment_id": appointment.id,
            "tx_hash": None,
            "amount_xrp": None,
            "message": f"Appointment is not eligible for release (status: {appointment.status}).",
        }

    try:
        result = finish_escrow(
            funder_address=case.funder_address,
            escrow_sequence=case.escrow_sequence,
            fulfillment_hex=case.fulfillment_hex,
            condition_hex=case.condition_hex,
        )
    except Exception as e:
        raise Exception(f"Identity matched but payment release failed: {e}")

    case.tx_hash_finish = result["tx_hash"]
    case.status = CaseStatus.RELEASED
    case.released_at = datetime.now(timezone.utc)

    appointment.status = AppointmentStatus.COMPLETED
    appointment.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(case)
    db.refresh(appointment)

    return {
        "matched": True,
        "case_id": case.id,
        "appointment_id": appointment.id,
        "tx_hash": result["tx_hash"],
        "amount_xrp": case.amount_xrp,
        "message": "Identity verified. Payment released to clinic.",
    }
    
def recover_access_code_by_email(email: str, db: Session) -> dict:
    case = db.query(FundingCase).filter(FundingCase.email == email).order_by(FundingCase.created_at.desc()).first()
    if not case:
        raise ValueError("No case found for this email")

    appointment = case.appointment

    return {
        "case_id": case.id,
        "appointment_id": appointment.id if appointment else None,
        "access_code": case.access_code,
        "message": "Access code recovered successfully.",
    }
