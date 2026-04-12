from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import BookAppointmentRequest, AppointmentResponse, UpdateAppointmentRequest
from services.appointment_service import (
    book_appointment,
    cancel_appointment,
    reschedule_appointment,
)
from models import ClinicSlot

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.post("", response_model=AppointmentResponse)
def book(request: BookAppointmentRequest, db: Session = Depends(get_db)):
    """Book a slot using patient access_code."""
    try:
        appointment = book_appointment(request.access_code, request.slot_id, db)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "BOOK_APPOINTMENT_FAILED",
                "detail": str(e),
            },
        )

    slot = db.query(ClinicSlot).filter(ClinicSlot.id == appointment.clinic_slot_id).first()
    if not slot or not slot.clinic:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "APPOINTMENT_RESPONSE_BUILD_FAILED",
                "detail": "Failed to load clinic slot details after booking.",
            },
        )

    clinic = slot.clinic

    return AppointmentResponse(
        id=appointment.id,
        patient_case_id=appointment.patient_case_id,
        slot_id=appointment.clinic_slot_id,
        clinic_name=clinic.name,
        slot_datetime=slot.slot_datetime,
        status=appointment.status,
        created_at=appointment.created_at,
    )


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update(appointment_id: str, request: UpdateAppointmentRequest, db: Session = Depends(get_db)):
    """
    Reschedule or cancel an appointment.
    action must be "reschedule" or "cancel".
    If action == "reschedule", new_slot_id is required.
    """
    try:
        if request.action == "cancel":
            appointment = cancel_appointment(request.access_code, appointment_id, db)
        elif request.action == "reschedule":
            if not request.new_slot_id:
                raise ValueError("new_slot_id is required for reschedule")
            appointment = reschedule_appointment(
                request.access_code,
                appointment_id,
                request.new_slot_id,
                db,
            )
        else:
            raise ValueError("action must be 'cancel' or 'reschedule'")
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "UPDATE_APPOINTMENT_FAILED",
                "detail": str(e),
            },
        )

    slot = db.query(ClinicSlot).filter(ClinicSlot.id == appointment.clinic_slot_id).first()
    if not slot or not slot.clinic:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "APPOINTMENT_RESPONSE_BUILD_FAILED",
                "detail": "Failed to load clinic slot details after update.",
            },
        )

    clinic = slot.clinic

    return AppointmentResponse(
        id=appointment.id,
        patient_case_id=appointment.patient_case_id,
        slot_id=appointment.clinic_slot_id,
        clinic_name=clinic.name,
        slot_datetime=slot.slot_datetime,
        status=appointment.status,
        created_at=appointment.created_at,
    )