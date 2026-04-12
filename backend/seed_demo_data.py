from datetime import datetime, timedelta, timezone

from database import SessionLocal, Base, engine
from models import (
    Clinic,
    ClinicSlot,
    PatientCase,
    Appointment,
    CompletionProof,
    FundingCase,
    Voucher,
    SlotStatus,
    AppointmentStatus,
    CareStatus,
    CaseStatus,
    VoucherStatus,
)


def seed_clinics_and_slots(db):
    clinics_data = [
        {
            "name": "Paris Women Care Center",
            "doctor_name": "Dr. Claire Martin",
            "address": "12 Rue de Rivoli",
            "city": "Paris",
            "xrpl_wallet_address": "rClinicDemo1111111111111111111111",
        },
        {
            "name": "Lyon Safe Access Clinic",
            "doctor_name": "Dr. Julie Bernard",
            "address": "8 Avenue Jean Jaurès",
            "city": "Lyon",
            "xrpl_wallet_address": "rClinicDemo2222222222222222222222",
        },
    ]

    clinics = []
    for data in clinics_data:
        clinic = db.query(Clinic).filter(
            Clinic.name == data["name"],
            Clinic.doctor_name == data["doctor_name"],
            Clinic.address == data["address"],
            Clinic.city == data["city"],
        ).first()

        if not clinic:
            clinic = Clinic(**data)
            db.add(clinic)
            db.flush()

        clinics.append(clinic)

    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)

    slot_offsets = [2, 3, 5, 7]
    for clinic in clinics:
        for days in slot_offsets:
            slot_time = now + timedelta(days=days, hours=10)

            existing_slot = db.query(ClinicSlot).filter(
                ClinicSlot.clinic_id == clinic.id,
                ClinicSlot.slot_datetime == slot_time,
            ).first()

            if not existing_slot:
                db.add(
                    ClinicSlot(
                        clinic_id=clinic.id,
                        slot_datetime=slot_time,
                        status=SlotStatus.AVAILABLE,
                    )
                )

    db.commit()
    return clinics


def seed_patient_cases(db):
    cases_data = [
        {
            "access_code": "DEMOCASE",
            "email": "demo.patient@example.com",
            "phone": "+33600000001",
            "country_of_origin": "Poland",
            "care_status": CareStatus.CREATED,
        },
        {
            "access_code": "INPROG01",
            "email": "progress.patient@example.com",
            "phone": "+33600000002",
            "country_of_origin": "Malta",
            "care_status": CareStatus.APPOINTMENT_REQUESTED,
        },
        {
            "access_code": "RELEASE1",
            "email": "released.patient@example.com",
            "phone": "+33600000003",
            "country_of_origin": "Andorra",
            "care_status": CareStatus.PAYMENT_RELEASED,
        },
    ]

    created_cases = []
    for data in cases_data:
        patient_case = db.query(PatientCase).filter(
            PatientCase.access_code == data["access_code"]
        ).first()

        if not patient_case:
            patient_case = PatientCase(**data)
            db.add(patient_case)
            db.flush()

        created_cases.append(patient_case)

    db.commit()
    return created_cases


def seed_in_progress_case(db, patient_case):
    if patient_case.appointment:
        return

    slot = db.query(ClinicSlot).filter(
        ClinicSlot.status == SlotStatus.AVAILABLE
    ).first()

    if not slot:
        raise RuntimeError("No available slot found for in-progress demo case.")

    slot.status = SlotStatus.BOOKED

    appointment = Appointment(
        patient_case_id=patient_case.id,
        clinic_slot_id=slot.id,
        status=AppointmentStatus.PENDING,
    )
    db.add(appointment)

    patient_case.care_status = CareStatus.APPOINTMENT_REQUESTED
    db.commit()


def seed_released_case(db, patient_case):
    if patient_case.appointment and patient_case.appointment.proof:
        return

    slot = db.query(ClinicSlot).filter(
        ClinicSlot.status == SlotStatus.AVAILABLE
    ).first()

    if not slot:
        raise RuntimeError("No available slot found for released demo case.")

    slot.status = SlotStatus.BOOKED

    funding_case = FundingCase(
        funder_address="rFunderDemo111111111111111111111111",
        clinic_address="rClinicDemo1111111111111111111111",
        amount_xrp=50,
        amount_drops=50_000_000,
        escrow_sequence=123456,
        fulfillment_hex="DEMO_FULFILLMENT_HEX",
        condition_hex="DEMO_CONDITION_HEX",
        status=CaseStatus.RELEASED,
        tx_hash_create="DEMO_CREATE_HASH_001",
        tx_hash_finish="DEMO_FINISH_HASH_001",
        released_at=datetime.now(timezone.utc),
    )
    db.add(funding_case)
    db.flush()

    voucher = Voucher(
        funding_case_id=funding_case.id,
        status=VoucherStatus.REDEEMED,
        redeemed_at=datetime.now(timezone.utc),
    )
    db.add(voucher)
    db.flush()

    appointment = Appointment(
        patient_case_id=patient_case.id,
        clinic_slot_id=slot.id,
        funding_case_id=funding_case.id,
        status=AppointmentStatus.COMPLETED,
    )
    db.add(appointment)
    db.flush()

    proof = CompletionProof(
        appointment_id=appointment.id,
        rpps_invoice_number="RPPS-DEMO-0001",
        total_cost_eur=45000,
        pdf_filename=None,
        escrow_tx_hash="DEMO_FINISH_HASH_001",
    )
    db.add(proof)

    patient_case.care_status = CareStatus.PAYMENT_RELEASED
    db.commit()


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        clinics = seed_clinics_and_slots(db)
        patient_cases = seed_patient_cases(db)

        demo_case = next(c for c in patient_cases if c.access_code == "DEMOCASE")
        in_progress_case = next(c for c in patient_cases if c.access_code == "INPROG01")
        released_case = next(c for c in patient_cases if c.access_code == "RELEASE1")

        seed_in_progress_case(db, in_progress_case)
        seed_released_case(db, released_case)

        print("Demo data seeded successfully.")
        print("")
        print("Clinics:")
        for clinic in clinics:
            print(f"- {clinic.name} ({clinic.city})")

        print("")
        print("Patient demo cases:")
        print(f"- DEMOCASE   -> empty created case")
        print(f"- INPROG01   -> booked / in-progress case")
        print(f"- RELEASE1   -> completed / payment released case")

    finally:
        db.close()


if __name__ == "__main__":
    main()