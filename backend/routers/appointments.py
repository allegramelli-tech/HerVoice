from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import AppointmentResponse, UpdateAppointmentRequest, RecoverAccessCodeRequest, RecoverAccessCodeResponse
from services.case_service import cancel_appointment, reschedule_appointment, recover_access_code_by_email
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
            appointment = cancel_appointment(appointment_id, request.access_code, db)
        elif request.action == "reschedule":
            if not request.new_slot_id:
                raise ValueError("new_slot_id is required for reschedule")
            appointment = reschedule_appointment(
				appointment_id,
				request.access_code,
				request.new_slot_id,
				db,
			)
        else:
            raise ValueError("action must be 'reschedule' or 'cancel'")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return _build_appointment_response(appointment)

@router.post("/recover-access-code", response_model=RecoverAccessCodeResponse)
def recover_access_code(
    request: RecoverAccessCodeRequest,
    db: Session = Depends(get_db),
):
    try:
        result = recover_access_code_by_email(request.email, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return RecoverAccessCodeResponse(
        case_id=result["case_id"],
        appointment_id=result["appointment_id"],
        access_code=result["access_code"],
        message=result["message"],
    )