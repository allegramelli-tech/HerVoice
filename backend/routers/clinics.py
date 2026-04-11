from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import ClinicResponse, ClinicWithSlotsResponse, SlotResponse
from models import Clinic, ClinicSlot, SlotStatus

router = APIRouter(prefix="/api/clinics", tags=["clinics"])


@router.get("", response_model=List[ClinicResponse])
def list_clinics(city: Optional[str] = None, db: Session = Depends(get_db)):
    """
    List all clinics. Optionally filter by city (case-insensitive).
    Returns clinic info without slot details.
    """
    query = db.query(Clinic)
    if city:
        query = query.filter(Clinic.city.ilike(f"%{city}%"))
    return query.all()


@router.get("/{clinic_id}", response_model=ClinicWithSlotsResponse)
def get_clinic(clinic_id: str, db: Session = Depends(get_db)):
    """
    Get clinic details plus all AVAILABLE slots.
    Only returns available slots — booked/cancelled slots are not shown.
    """
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    available_slots = db.query(ClinicSlot).filter(
        ClinicSlot.clinic_id == clinic_id,
        ClinicSlot.status == SlotStatus.AVAILABLE,
    ).order_by(ClinicSlot.slot_datetime).all()

    return ClinicWithSlotsResponse(
        id=clinic.id,
        name=clinic.name,
        doctor_name=clinic.doctor_name,
        address=clinic.address,
        city=clinic.city,
        available_slots=[
            SlotResponse(
                id=s.id,
                clinic_id=s.clinic_id,
                slot_datetime=s.slot_datetime,
                status=s.status,
            )
            for s in available_slots
        ],
    )