from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import AppointmentResponse, UpdateAppointmentRequest
from services.case_service import cancel_appointment, reschedule_appointment
from models import Appointment

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


def _build_appointment_response(appointment: Appointment) -> AppointmentResponse:
    slot = appointment.slot
    clinic = slot.clinic

    return AppointmentResponse(
        id=appointment.id,
        funding_case_id=appointment.funding_case_id,
        slot_id=appointment.clinic_slot_id,
        clinic_name=clinic.name,
        slot_datetime=slot.slot_datetime,
        status=appointment.status,
        created_at=appointment.created_at,
    )


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: str,
    request: UpdateAppointmentRequest,
    db: Session = Depends(get_db),
):
    try:
        if request.action == "cancel":
            appointment = cancel_appointment(appointment_id, db)
        elif request.action == "reschedule":
            if not request.new_slot_id:
                raise ValueError("new_slot_id is required for reschedule")
            appointment = reschedule_appointment(appointment_id, request.new_slot_id, db)
        else:
            raise ValueError("action must be 'reschedule' or 'cancel'")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return _build_appointment_response(appointment)