BEGIN;

DO $$
DECLARE
    operator_count BIGINT := 0;
    call_reference_count BIGINT := 0;
    job_reference_count BIGINT := 0;
BEGIN
    IF to_regclass('public.operators') IS NOT NULL THEN
        EXECUTE 'SELECT COUNT(*) FROM public.operators' INTO operator_count;
    END IF;

    IF to_regclass('public.call_records') IS NULL OR to_regclass('public.asr_jobs') IS NULL THEN
        RAISE EXCEPTION 'Expected call_records and asr_jobs tables before removing operators';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'call_records' AND column_name = 'operator_id'
    ) THEN
        EXECUTE 'SELECT COUNT(*) FROM public.call_records WHERE operator_id IS NOT NULL' INTO call_reference_count;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'asr_jobs' AND column_name = 'operator_id'
    ) THEN
        EXECUTE 'SELECT COUNT(*) FROM public.asr_jobs WHERE operator_id IS NOT NULL' INTO job_reference_count;
    END IF;

    IF operator_count <> 0 OR call_reference_count <> 0 OR job_reference_count <> 0 THEN
        RAISE EXCEPTION 'Operator migration stopped: operators=%, call_records.operator_id=%, asr_jobs.operator_id=%',
            operator_count, call_reference_count, job_reference_count;
    END IF;
END $$;

ALTER TABLE public.call_records DROP COLUMN IF EXISTS operator_id;
ALTER TABLE public.asr_jobs DROP COLUMN IF EXISTS operator_id;
DROP TABLE IF EXISTS public.operators;

COMMIT;
