from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import ClinicRegisterRequest, ClinicResponse, SlotCreateRequest, SlotResponse
from models import Clinic, ClinicSlot, Appointment, FundingCase

router = APIRouter(prefix="/api/clinic-admin", tags=["clinic-admin"])


@router.post("/register", response_model=ClinicResponse)
def register_clinic(request: ClinicRegisterRequest, db: Session = Depends(get_db)):
    """Register a new clinic. No verification in MVP."""
    clinic = Clinic(
        name=request.name,
        doctor_name=request.doctor_name,
        address=request.address,
        city=request.city,
        xrpl_wallet_address=request.xrpl_wallet_address,
    )
    db.add(clinic)
    db.commit()
    db.refresh(clinic)
    return clinic


@router.post("/{clinic_id}/slots", response_model=SlotResponse)
def add_slot(clinic_id: str, request: SlotCreateRequest, db: Session = Depends(get_db)):
    """Add an available slot for a clinic."""
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    slot = ClinicSlot(
        clinic_id=clinic_id,
        slot_datetime=request.slot_datetime,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


@router.get("/{clinic_id}/appointments")
def get_clinic_appointments(clinic_id: str, db: Session = Depends(get_db)):
    """
    Get all appointments for a clinic.
    Returns appointment details including patient case ID (not patient PII).
    """
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    slots = db.query(ClinicSlot).filter(ClinicSlot.clinic_id == clinic_id).all()
    slot_ids = [s.id for s in slots]

    if not slot_ids:
        return []

    appointments = db.query(Appointment).filter(
        Appointment.clinic_slot_id.in_(slot_ids)
    ).all()

    result = []
    for appt in appointments:
        slot = next(s for s in slots if s.id == appt.clinic_slot_id)
        result.append({
            "appointment_id": appt.id,
            "patient_case_id": appt.patient_case_id,
            "slot_datetime": slot.slot_datetime.isoformat(),
            "status": appt.status.value,
            "funding_case_id": appt.funding_case_id,
        })

    return result


@router.patch("/appointments/{appointment_id}/link-funding")
def link_funding_case(
    appointment_id: str,
    funding_case_id: str,
    db: Session = Depends(get_db),
):
    """
    Link a FundingCase to an Appointment.
    Called after funder creates escrow via POST /api/fund.
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    funding_case = db.query(FundingCase).filter(FundingCase.id == funding_case_id).first()
    if not funding_case:
        raise HTTPException(status_code=404, detail="Funding case not found")

    appointment.funding_case_id = funding_case_id
    db.commit()

    return {
        "appointment_id": appointment_id,
        "funding_case_id": funding_case_id,
        "message": "Linked.",
    }