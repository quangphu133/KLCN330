# Project repair and verification report

Date: 2026-09-28

## Completed changes

- Database creation and built-in regex seeding now run explicitly with `python -m app.db.init_db`, not as an import side effect. Seeding is idempotent and preserves user edits.
- PostgreSQL uses the installed `psycopg2` driver. Tested backend versions are recorded in `backend/requirements.lock.txt`.
- Backend tests use a unique temporary SQLite database and upload directory. Coverage includes email CRUD/sign-in, expired JWTs, safe regex seeding, ASR failure with a null score, analytics, results, and Excel output.
- Calls saved after ASR failure retain their audio and have no score. Unscored calls are omitted from score averages and histograms, and display as `Chưa chấm điểm` in the calls table and Excel.
- Pydantic v2 schema configuration and UTC creation times were updated while preserving naive UTC values in existing naive database columns.
- Both ASR copies preserve words without timestamps as `unknown`, do not create fabricated audio regions, and suggest an agent only for two speakers with unique role evidence. Typed aiohttp state is initialized before startup; worker output is explicitly UTF-8.
- The diarization environment has TorchCodec 0.9.0 and FFmpeg shared 8.1. `ASR_FFMPEG_BIN` registers the FFmpeg DLL path inside the Windows diarization worker. Exact diarization package versions are locked in both ASR copies.
- Frontend changes include local Arimo fonts and OFL, stable filter date dependencies, complete audio/transcript effect dependencies, reset-only upload clearing, Next Image for the SVG background, removal of debug logging, and null-aware score display.
- `/api/v1` has been removed from backend registration. `/api` is the sole public prefix; the old path returns 404 and is absent from OpenAPI.

## Verification results

- Pre-change database dump: `DoAn/_prechange_backup_20260928/do_an_db_before_changes.dump`.
- Pre-change source/config archive: `DoAn/_prechange_backup_20260928/source_before_changes.zip`.
- Legacy score-correction candidates: `DoAn/_prechange_backup_20260928/candidate-score-repair.csv`. No rows matched, so no existing call score was changed.
- PostgreSQL 18.6 connectivity and the explicit initialization command passed. The schema already included `call_records.analysis_data`; six built-in regex rows were present afterward.
- Backend: `7 passed`; `pip check` clean. One Starlette deprecation warning remains for its `httpx` test-client integration.
- ASR API tests: `14 passed` in the repository-level copy and `13 passed` in `DoAn/api`, with no test warnings.
- PyTorch `2.9.1+cu128` detected CUDA on the RTX 3060. BuzzASR loaded the local 3 GB checkpoint and transcribed an 11.65 second sample on CUDA FP16; JSON/TXT/SRT output generation passed in a temporary directory.
- Hugging Face access was verified. The pyannote Community-1 model processed a 78.36 second local sample on CUDA, found two speakers, and completed in about 16 seconds. Its subprocess worker also completed with two speakers in about 10 seconds.
- Full local integration passed after removing `/api/v1`: upload through backend `/api/transcribe/upload` → local ASR API → BuzzASR transcript → pyannote diarization → backend result → authenticated speaker-role confirmation. The call had two speakers and 35 transcript chunks; score changed from `null` to 75 after confirmation, the role mapping persisted, and repeating confirmation did not add violations. Test DB and upload data were temporary.
- The AI API also passed its `/api` job/result flow with 16 ASR segments and completed two-speaker diarization. Existing root-copy TXT/SRT routes passed their API tests.
- Diarization environment `pip check`, TorchCodec import, FFmpeg-backed WAV decode, pyannote import, and model inference passed. No token was written to project files; the API test process was stopped after testing.
- Frontend `npx tsc --noEmit` passed. `npm run lint` has zero errors and one existing `max-lines` warning for the 685-line `call.tsx`. Production build passed using `.next-verify`; `/`, `/calls`, `/auth/sign-in`, and `/uploading-record` returned HTTP 200.

## Remaining operational notes

- Tailscale was not used, as requested. The remote host `100.73.116.10:8000` was not revalidated.
- Port 8001 was already occupied by existing listeners, so I did not stop them. The updated backend was tested through an isolated TestClient and real local ASR API; the live process already on 8001 must be restarted separately before a browser using that port sees this backend code.
- The local AI test environment is `.venv-asr-local`; it uses the existing checkpoint at `models/buzzasr/ctranslate2`. For same-computer operation, configure backend `ASR_BASE_URL` to `http://127.0.0.1:8000`, use the diarization Python at `.venv-diarization\\Scripts\\python.exe`, set `ASR_FFMPEG_BIN` to `.venv-diarization\\ffmpeg\\bin`, and configure the same temporary/runtime API key on both processes. Keep the Hugging Face token in the ASR process environment, not project files.
- `DoAn/api` retains its own result/export route set; the repository-level ASR copy retains the tested TXT/SRT routes. The backend result JSON flow was verified end to end.

## Startup

From `DoAn/backend`, activate `..\\.venv-doan\\Scripts\\Activate.ps1`, configure `.env`, run `python -m app.db.init_db`, then run `python run.py`. Start the local AI service separately with its ASR environment and model path before uploading.
