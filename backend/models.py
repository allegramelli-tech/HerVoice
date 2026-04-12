from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum

from database import Base


class CaseStatus(str, enum.Enum):
    PENDING = "pending"       # case created, waiting for funder escrow
    ACTIVE = "active"         # escrow confirmed, waiting for patient arrival
    RELEASED = "released"     # identity matched, payment released
    FAILED = "failed"         # escrow creation failed
    CANCELLED = "cancelled"   # case cancelled before release


class SlotStatus(str, enum.Enum):
    AVAILABLE = "available"
    BOOKED = "booked"
    CANCELLED = "cancelled"


class AppointmentStatus(str, enum.Enum):
    BOOKED = "booked"
    CANCELLED_BY_USER = "cancelled_by_user"
    CANCELLED_BY_CLINIC = "cancelled_by_clinic"
    COMPLETED = "completed"


class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    xrpl_wallet_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    slots = relationship("ClinicSlot", back_populates="clinic")


class ClinicSlot(Base):
    __tablename__ = "clinic_slots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    clinic_id = Column(String, ForeignKey("clinics.id"), nullable=False)
    slot_datetime = Column(DateTime, nullable=False)
    status = Column(SAEnum(SlotStatus), nullable=False, default=SlotStatus.AVAILABLE)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    clinic = relationship("Clinic", back_populates="slots")
    appointment = relationship("Appointment", back_populates="slot", uselist=False)


class FundingCase(Base):
    __tablename__ = "funding_cases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Only patient-related data stored in DB
    patient_hash = Column(String, nullable=False)

    funder_address = Column(String, nullable=True)
    clinic_address = Column(String, nullable=False)
    amount_xrp = Column(Integer, nullable=False)
    amount_drops = Column(Integer, nullable=False)

    escrow_sequence = Column(Integer, nullable=True)
    fulfillment_hex = Column(String, nullable=True)
    condition_hex = Column(String, nullable=True)

    status = Column(SAEnum(CaseStatus), nullable=False, default=CaseStatus.PENDING)
    tx_hash_create = Column(String, nullable=True)
    tx_hash_finish = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    released_at = Column(DateTime, nullable=True)

    appointment = relationship("Appointment", back_populates="funding_case", uselist=False)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    funding_case_id = Column(String, ForeignKey("funding_cases.id"), nullable=False, unique=True)
    clinic_slot_id = Column(String, ForeignKey("clinic_slots.id"), nullable=False)
    status = Column(SAEnum(AppointmentStatus), nullable=False, default=AppointmentStatus.BOOKED)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    funding_case = relationship("FundingCase", back_populates="appointment")
    slot = relationship("ClinicSlot", back_populates="appointment")

# from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SAEnum
# from sqlalchemy.orm import relationship
# from datetime import datetime, timezone
# import uuid
# import enum
# from database import Base


# class CaseStatus(str, enum.Enum):
#     PENDING = "pending"       # escrow tx submitted but not yet confirmed on-chain
#     ACTIVE = "active"         # escrow confirmed, voucher ready to use
#     RELEASED = "released"     # escrow finished, payment sent to clinic
#     FAILED = "failed"         # escrow create tx failed


# class VoucherStatus(str, enum.Enum):
#     UNUSED = "unused"
#     REDEEMED = "redeemed"
#     EXPIRED = "expired"


# class FundingCase(Base):
#     __tablename__ = "funding_cases"

#     id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
#     funder_address = Column(String, nullable=False)
#     clinic_address = Column(String, nullable=False)
#     amount_xrp = Column(Integer, nullable=False)       # in XRP (whole number), NOT drops
#     amount_drops = Column(Integer, nullable=False)     # amount_xrp * 1_000_000
#     escrow_sequence = Column(Integer, nullable=True)   # sequence number of EscrowCreate tx
#     fulfillment_hex = Column(String, nullable=True)    # secret — used by EscrowFinish, never exposed in API
#     condition_hex = Column(String, nullable=True)      # public — written into EscrowCreate
#     status = Column(SAEnum(CaseStatus), nullable=False, default=CaseStatus.PENDING)
#     tx_hash_create = Column(String, nullable=True)     # hash of EscrowCreate tx
#     tx_hash_finish = Column(String, nullable=True)     # hash of EscrowFinish tx
#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
#     released_at = Column(DateTime, nullable=True)

#     voucher = relationship("Voucher", back_populates="funding_case", uselist=False)


# class Voucher(Base):
#     __tablename__ = "vouchers"

#     id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
#     funding_case_id = Column(String, ForeignKey("funding_cases.id"), nullable=False, unique=True)
#     status = Column(SAEnum(VoucherStatus), nullable=False, default=VoucherStatus.UNUSED)
#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
#     redeemed_at = Column(DateTime, nullable=True)

#     funding_case = relationship("FundingCase", back_populates="voucher")
    
    
# class SlotStatus(str, enum.Enum):
#     AVAILABLE = "available"
#     BOOKED = "booked"
#     CANCELLED = "cancelled"


# class AppointmentStatus(str, enum.Enum):
#     PENDING = "pending"               # booked but not yet confirmed by clinic
#     CONFIRMED = "confirmed"           # clinic confirmed
#     RESCHEDULED = "rescheduled"
#     CANCELLED_BY_USER = "cancelled_by_user"
#     CANCELLED_BY_CLINIC = "cancelled_by_clinic"
#     COMPLETED = "completed"           # proof submitted, escrow released


# class CareStatus(str, enum.Enum):
#     CREATED = "created"
#     APPOINTMENT_REQUESTED = "appointment_requested"
#     APPOINTMENT_CONFIRMED = "appointment_confirmed"
#     CARE_COMPLETED = "care_completed"
#     PROOF_SUBMITTED = "proof_submitted"
#     PAYMENT_RELEASED = "payment_released"


# class Clinic(Base):
#     __tablename__ = "clinics"

#     id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
#     name = Column(String, nullable=False)
#     doctor_name = Column(String, nullable=False)
#     address = Column(String, nullable=False)
#     city = Column(String, nullable=False)
#     # xrpl_wallet_address is not used for payment routing in MVP
#     # (clinic wallet is fixed in .env). Stored for display only.
#     xrpl_wallet_address = Column(String, nullable=True)
#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

#     slots = relationship("ClinicSlot", back_populates="clinic")


# class ClinicSlot(Base):
#     __tablename__ = "clinic_slots"

#     id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
#     clinic_id = Column(String, ForeignKey("clinics.id"), nullable=False)
#     slot_datetime = Column(DateTime, nullable=False)   # UTC
#     status = Column(SAEnum(SlotStatus), nullable=False, default=SlotStatus.AVAILABLE)
#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

#     clinic = relationship("Clinic", back_populates="slots")
#     appointment = relationship("Appointment", back_populates="slot", uselist=False)


# class PatientCase(Base):
#     __tablename__ = "patient_cases"

#     id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
#     # access_code: shown to user after case creation, used to look up their case.
#     # This replaces magic link for hackathon. Format: 8 random uppercase alphanumeric chars.
#     access_code = Column(String, nullable=False, unique=True)
#     email = Column(String, nullable=False)
#     phone = Column(String, nullable=True)
#     country_of_origin = Column(String, nullable=False)
#     care_status = Column(SAEnum(CareStatus), nullable=False, default=CareStatus.CREATED)
#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

#     appointment = relationship("Appointment", back_populates="patient_case", uselist=False)


# class Appointment(Base):
#     __tablename__ = "appointments"

#     id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
#     patient_case_id = Column(String, ForeignKey("patient_cases.id"), nullable=False, unique=True)
#     clinic_slot_id = Column(String, ForeignKey("clinic_slots.id"), nullable=False)
#     # funding_case_id: set when funder creates escrow for this appointment.
#     # Null until funder acts. In hackathon demo, funder creates escrow independently
#     # and links it here manually or via the fund endpoint.
#     funding_case_id = Column(String, ForeignKey("funding_cases.id"), nullable=True)
#     status = Column(SAEnum(AppointmentStatus), nullable=False, default=AppointmentStatus.PENDING)
#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
#     updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

#     patient_case = relationship("PatientCase", back_populates="appointment")
#     slot = relationship("ClinicSlot", back_populates="appointment")
#     funding_case = relationship("FundingCase")
#     proof = relationship("CompletionProof", back_populates="appointment", uselist=False)


# class CompletionProof(Base):
#     __tablename__ = "completion_proofs"

#     id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
#     appointment_id = Column(String, ForeignKey("appointments.id"), nullable=False, unique=True)
#     rpps_invoice_number = Column(String, nullable=False)
#     total_cost_eur = Column(Integer, nullable=False)   # in EUR cents to avoid float
#     pdf_filename = Column(String, nullable=True)       # filename stored in uploads/ directory
#     submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
#     # escrow_tx_hash: populated after successful EscrowFinish
#     escrow_tx_hash = Column(String, nullable=True)

#     appointment = relationship("Appointment", back_populates="proof")