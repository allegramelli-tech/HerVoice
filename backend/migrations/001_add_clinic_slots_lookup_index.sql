CREATE INDEX IF NOT EXISTS ix_clinic_slots_clinic_status_datetime
    ON clinic_slots (clinic_id, status, slot_datetime);
