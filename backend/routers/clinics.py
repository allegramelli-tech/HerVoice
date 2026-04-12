from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    ClinicRegisterRequest,
    ClinicResponse,
    SlotCreateRequest,
    SlotResponse,
    ClinicWithSlotsResponse,
)
from services.case_service import (
    register_clinic,
    create_slot,
    delete_slot,
    list_clinics_with_available_slots,
)
from models import SlotStatus

router = APIRouter(prefix="/api/clinics", tags=["clinics"])


@router.post("", response_model=ClinicResponse)
def create_clinic(request: ClinicRegisterRequest, db: Session = Depends(get_db)):
    try:
        clinic = register_clinic(
            name=request.name,
            doctor_name=request.doctor_name,
            address=request.address,
            city=request.city,
            xrpl_wallet_address=request.xrpl_wallet_address,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ClinicResponse(
        id=clinic.id,
        name=clinic.name,
        doctor_name=clinic.doctor_name,
        address=clinic.address,
        city=clinic.city,
        created_at=clinic.created_at,
    )


@router.post("/{clinic_id}/slots", response_model=SlotResponse)
def create_clinic_slot(clinic_id: str, request: SlotCreateRequest, db: Session = Depends(get_db)):
    try:
        slot = create_slot(clinic_id=clinic_id, slot_datetime=request.slot_datetime, db=db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return SlotResponse(
        id=slot.id,
        clinic_id=slot.clinic_id,
        slot_datetime=slot.slot_datetime,
        status=slot.status,
    )


@router.delete("/{clinic_id}/slots/{slot_id}")
def delete_clinic_slot(clinic_id: str, slot_id: str, db: Session = Depends(get_db)):
    try:
        delete_slot(clinic_id=clinic_id, slot_id=slot_id, db=db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Slot deleted successfully."}


@router.get("", response_model=list[ClinicWithSlotsResponse])
def get_clinics(db: Session = Depends(get_db)):
    clinics = list_clinics_with_available_slots(db)

    result = []
    for clinic in clinics:
        available_slots = [
            SlotResponse(
                id=slot.id,
                clinic_id=slot.clinic_id,
                slot_datetime=slot.slot_datetime,
                status=slot.status,
            )
            for slot in clinic.slots
            if slot.status == SlotStatus.AVAILABLE
        ]

        result.append(
            ClinicWithSlotsResponse(
                id=clinic.id,
                name=clinic.name,
                doctor_name=clinic.doctor_name,
                address=clinic.address,
                city=clinic.city,
                available_slots=available_slots,
            )
        )

    return result
