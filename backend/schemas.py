from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from models import CaseStatus, VoucherStatus, SlotStatus, AppointmentStatus, CareStatus


# --- Request bodies ---

class CreateFundRequest(BaseModel):
    amount_xrp: int = Field(..., ge=1, le=1000, description="Amount in XRP, minimum 1, maximum 1000")


class VerifyVoucherRequest(BaseModel):
    voucher_id: str


class ConfirmServiceRequest(BaseModel):
    voucher_id: str


# --- Response bodies ---

class CreateFundResponse(BaseModel):
    case_id: str
    voucher_id: str
    amount_xrp: int
    escrow_tx_hash: str
    status: CaseStatus
    message: str


class VoucherStatusResponse(BaseModel):
    voucher_id: str
    status: VoucherStatus
    funding_case_id: str
    amount_xrp: int
    case_status: CaseStatus
    created_at: datetime
    redeemed_at: Optional[datetime]


class VerifyVoucherResponse(BaseModel):
    voucher_id: str
    valid: bool
    status: Optional[VoucherStatus]
    amount_xrp: Optional[int]
    message: str


class ConfirmServiceResponse(BaseModel):
    voucher_id: str
    case_id: str
    tx_hash: str
    amount_xrp: int
    clinic_address: str
    message: str


class DashboardCase(BaseModel):
    case_id: str
    voucher_id: Optional[str]
    amount_xrp: int
    case_status: CaseStatus
    voucher_status: Optional[VoucherStatus]
    tx_hash_create: Optional[str]
    tx_hash_finish: Optional[str]
    created_at: datetime
    released_at: Optional[datetime]


class DashboardResponse(BaseModel):
    total_cases: int
    total_xrp_locked: int
    total_xrp_released: int
    cases: list[DashboardCase]
    
# --- Clinic schemas ---

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
    slot_datetime: datetime   # ISO 8601, UTC


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


# --- Patient case schemas ---

class CreatePatientCaseRequest(BaseModel):
    email: str
    phone: Optional[str] = None
    country_of_origin: str


class CreatePatientCaseResponse(BaseModel):
    case_id: str
    access_code: str   # shown to user once — they use this to look up their case
    care_status: CareStatus
    message: str


class PatientCaseStatusResponse(BaseModel):
    case_id: str
    care_status: CareStatus
    appointment: Optional[Dict[str, Any]]   # simplified appointment info, None if not booked


# --- Appointment schemas ---

class BookAppointmentRequest(BaseModel):
    access_code: str    # patient uses this instead of auth
    slot_id: str


class AppointmentResponse(BaseModel):
    id: str
    patient_case_id: str
    slot_id: str
    clinic_name: str
    slot_datetime: datetime
    status: AppointmentStatus
    created_at: datetime


class UpdateAppointmentRequest(BaseModel):
    access_code: str
    action: str   # "reschedule" | "cancel"
    new_slot_id: Optional[str] = None   # required if action == "reschedule"


# --- Proof schemas ---

class SubmitProofRequest(BaseModel):
    appointment_id: str
    rpps_invoice_number: str
    total_cost_eur: int   # in EUR cents


class SubmitProofResponse(BaseModel):
    proof_id: str
    appointment_id: str
    escrow_tx_hash: Optional[str]
    message: str