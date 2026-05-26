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

    # Only patient-related identity data stored for matching
    patient_hash = Column(String, nullable=False)

    # Recovery / case management (OFF-CHAIN ONLY)
    access_code = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False)
    country = Column(String, nullable=True)

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
