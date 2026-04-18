from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from models import CaseStatus, SlotStatus, AppointmentStatus


class PatientIdentity(BaseModel):
    name: str
    date_of_birth: str
    insurance_number: str


# --------------------
# Clinic / Slot
# --------------------

class ClinicRegisterRequest(BaseModel):
    name: str
    doctor_name: str
    address: str
    city: str
    xrpl_wallet_address: Optional[str] = None


class ClinicResponse(BaseModel):
    id: str
    name: str
    doctor_name: str
    address: str
    city: str
    created_at: datetime


class SlotCreateRequest(BaseModel):
    slot_datetime: datetime


class SlotResponse(BaseModel):
    id: str
    clinic_id: str
    slot_datetime: datetime
    status: SlotStatus


class ClinicWithSlotsResponse(BaseModel):
    id: str
    name: str
    doctor_name: str
    address: str
    city: str
    available_slots: List[SlotResponse]


# --------------------
# Case + Appointment
# --------------------

class CreateCaseRequest(BaseModel):
    patient_identity: PatientIdentity
    slot_id: str
    email: str
    country: Optional[str] = None
    amount_xrp: int = Field(..., ge=1, le=1000, description="Amount of funding needed in XRP")


class CreateCaseResponse(BaseModel):
    case_id: str
    appointment_id: str
    slot_id: str
    access_code: str
    amount_xrp: int
    status: CaseStatus
    message: str


class AppointmentResponse(BaseModel):
    id: str
    funding_case_id: str
    slot_id: str
    clinic_name: str
    slot_datetime: datetime
    status: AppointmentStatus
    created_at: datetime


class UpdateAppointmentRequest(BaseModel):
    access_code: str
    action: str   # "reschedule" | "cancel"
    new_slot_id: Optional[str] = None
    
class RecoverAccessCodeRequest(BaseModel):
    email: str


class RecoverAccessCodeResponse(BaseModel):
    case_id: str
    appointment_id: Optional[str]
    access_code: str
    message: str


# --------------------
# Funding
# --------------------

class CreateFundRequest(BaseModel):
    case_id: str


class CreateFundResponse(BaseModel):
    case_id: str
    amount_xrp: int
    escrow_tx_hash: str
    status: CaseStatus
    message: str


# --------------------
# Clinic verify + release
# --------------------

class VerifyAndReleaseRequest(BaseModel):
    patient_identity: PatientIdentity


class VerifyAndReleaseResponse(BaseModel):
    matched: bool
    case_id: Optional[str]
    appointment_id: Optional[str]
    tx_hash: Optional[str]
    amount_xrp: Optional[int]
    message: str


# --------------------
# Dashboard
# --------------------

class DashboardCase(BaseModel):
    case_id: str
    patient_hash: str
    amount_xrp: int
    status: CaseStatus
    appointment_id: Optional[str]
    slot_datetime: Optional[datetime]
    clinic_name: Optional[str]
    tx_hash_create: Optional[str]
    tx_hash_finish: Optional[str]
    created_at: datetime
    released_at: Optional[datetime]


class DashboardResponse(BaseModel):
    total_cases: int
    total_xrp_locked: int
    total_xrp_released: int
    total_clinics: int
    total_slots: int
    total_booked_appointments: int
    total_completed_appointments: int
    cases: List[DashboardCase]

class CaseStatusAppointmentInfo(BaseModel):
    appointment_id: str
    clinic_name: str
    clinic_address: str
    slot_datetime: datetime
    status: AppointmentStatus


class PatientCaseStatusResponse(BaseModel):
    case_id: str
    status: CaseStatus
    appointment: Optional[CaseStatusAppointmentInfo] = None