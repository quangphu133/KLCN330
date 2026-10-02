CREATE TABLE IF NOT EXISTS call_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_key VARCHAR(160) NOT NULL UNIQUE,
    event_type VARCHAR(40) NOT NULL,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(500) NOT NULL,
    call_record_id INTEGER NULL REFERENCES call_records(id) ON DELETE CASCADE,
    asr_job_id INTEGER NULL REFERENCES asr_jobs(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_call_notifications_user_id
    ON call_notifications(user_id);
