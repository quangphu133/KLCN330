BEGIN;

CREATE TABLE IF NOT EXISTS public.operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.call_records ADD COLUMN IF NOT EXISTS operator_id INTEGER;
ALTER TABLE public.asr_jobs ADD COLUMN IF NOT EXISTS operator_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'call_records_operator_id_fkey'
          AND conrelid = 'public.call_records'::regclass
    ) THEN
        ALTER TABLE public.call_records
            ADD CONSTRAINT call_records_operator_id_fkey
            FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'asr_jobs_operator_id_fkey'
          AND conrelid = 'public.asr_jobs'::regclass
    ) THEN
        ALTER TABLE public.asr_jobs
            ADD CONSTRAINT asr_jobs_operator_id_fkey
            FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;
