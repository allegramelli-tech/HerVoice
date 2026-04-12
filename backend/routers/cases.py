from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import CreateCaseRequest, CreateCaseResponse
from services.case_service import create_case_with_appointment

router = APIRouter(prefix="/api/cases", tags=["cases"])


@router.post("", response_model=CreateCaseResponse)
def create_case(request: CreateCaseRequest, db: Session = Depends(get_db)):
    try:
        case, appointment = create_case_with_appointment(
			name=request.patient_identity.name,
			date_of_birth=request.patient_identity.date_of_birth,
			insurance_number=request.patient_identity.insurance_number,
			slot_id=request.slot_id,
			email=request.email,
			country=request.country,
			amount_xrp=request.amount_xrp,
			db=db,
		)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return CreateCaseResponse(
		case_id=case.id,
		appointment_id=appointment.id,
		slot_id=appointment.clinic_slot_id,
		access_code=case.access_code,
		amount_xrp=case.amount_xrp,
		status=case.status,
		message="Case created and slot booked. Save your access code to manage your appointment later.",
	)

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from database import get_db
# from schemas import CreatePatientCaseRequest, CreatePatientCaseResponse, PatientCaseStatusResponse
# from services.appointment_service import create_patient_case, get_case_by_access_code

# router = APIRouter(prefix="/api/cases", tags=["cases"])


# @router.post("", response_model=CreatePatientCaseResponse)
# def create_case(request: CreatePatientCaseRequest, db: Session = Depends(get_db)):
#     """
#     Create a new patient case.
#     Returns an access_code — the patient must save this to manage their case.
#     No accounts, no passwords, no magic links.
#     """
#     case = create_patient_case(request.email, request.phone, request.country_of_origin, db)
#     return CreatePatientCaseResponse(
#         case_id=case.id,
#         access_code=case.access_code,
#         care_status=case.care_status,
#         message=f"Case created. Save your access code: {case.access_code}",
#     )


# @router.get("/status", response_model=PatientCaseStatusResponse)
# def get_case_status(access_code: str, db: Session = Depends(get_db)):
#     """
#     Look up case status by access_code.
#     access_code is passed as a query parameter: /api/cases/status?access_code=XXXX
#     """
#     case = get_case_by_access_code(access_code, db)
#     if not case:
#         raise HTTPException(status_code=404, detail="Access code not found")

#     appointment_info = None
#     if case.appointment:
#         appt = case.appointment
#         slot = appt.slot
#         clinic = slot.clinic
#         appointment_info = {
#             "appointment_id": appt.id,
#             "clinic_name": clinic.name,
#             "clinic_address": clinic.address,
#             "slot_datetime": slot.slot_datetime.isoformat(),
#             "status": appt.status.value,
#         }

#     return PatientCaseStatusResponse(
#         case_id=case.id,
#         care_status=case.care_status,
#         appointment=appointment_info,
#     )