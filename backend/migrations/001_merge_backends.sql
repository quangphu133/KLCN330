-- Compatibility migration for databases created by the former root app/ backend.
-- Run once against the PostgreSQL database before starting the merged backend.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'username'
    ) THEN
        ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
        UPDATE users
        SET email = username || '@legacy.local'
        WHERE email IS NULL AND username IS NOT NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);

ALTER TABLE call_records ADD COLUMN IF NOT EXISTS operator_id INTEGER;
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS project_id INTEGER;
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS client_number VARCHAR(50);

ALTER TABLE asr_jobs ADD COLUMN IF NOT EXISTS operator_id INTEGER;
ALTER TABLE asr_jobs ADD COLUMN IF NOT EXISTS project_id INTEGER;
ALTER TABLE asr_jobs ADD COLUMN IF NOT EXISTS client_number VARCHAR(50);
ALTER TABLE asr_jobs ADD COLUMN IF NOT EXISTS requested_call_date TIMESTAMP;
