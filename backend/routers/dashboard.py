from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import DashboardResponse, DashboardCase
from models import FundingCase, CaseStatus, Clinic, ClinicSlot, Appointment, AppointmentStatus

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    cases = db.query(FundingCase).order_by(FundingCase.created_at.desc()).all()

    total_locked = sum(c.amount_xrp for c in cases if c.status == CaseStatus.ACTIVE)
    total_released = sum(c.amount_xrp for c in cases if c.status == CaseStatus.RELEASED)

    total_clinics = db.query(Clinic).count()
    total_slots = db.query(ClinicSlot).count()
    total_booked_appointments = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.BOOKED
    ).count()
    total_completed_appointments = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.COMPLETED
    ).count()

    result_cases = []
    for c in cases:
        appointment = c.appointment
        slot_datetime = None
        clinic_name = None
        appointment_id = None

        if appointment:
            appointment_id = appointment.id
            if appointment.slot:
                slot_datetime = appointment.slot.slot_datetime
                if appointment.slot.clinic:
                    clinic_name = appointment.slot.clinic.name

        result_cases.append(
            DashboardCase(
                case_id=c.id,
                patient_hash=c.patient_hash,
                amount_xrp=c.amount_xrp,
                status=c.status,
                appointment_id=appointment_id,
                slot_datetime=slot_datetime,
                clinic_name=clinic_name,
                tx_hash_create=c.tx_hash_create,
                tx_hash_finish=c.tx_hash_finish,
                created_at=c.created_at,
                released_at=c.released_at,
            )
        )

    return DashboardResponse(
        total_cases=len(cases),
        total_xrp_locked=total_locked,
        total_xrp_released=total_released,
        total_clinics=total_clinics,
        total_slots=total_slots,
        total_booked_appointments=total_booked_appointments,
        total_completed_appointments=total_completed_appointments,
        cases=result_cases,
    )
