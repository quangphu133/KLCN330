-- Store ASR word timestamps, diarization turns and confirmed speaker roles.
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS analysis_data JSONB;
