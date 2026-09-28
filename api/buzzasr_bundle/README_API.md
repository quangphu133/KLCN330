# Remote BuzzASR API

This API runs on the computer with the RTX 3060. A Python backend on another
computer uploads an audio file through a private Tailscale network, receives a
job ID, and polls for the completed transcript. The backend does not need the
BuzzASR model or CUDA.

## Deployment layout

Keep the source bundle and model as separate directories:

```text
KLTN330/
├── buzzasr_bundle/                 # this code and the API client
│   ├── package/api_server.py       # run on the GPU computer
│   └── client/api_client.py        # copy to the backend computer
└── models/buzzasr/ctranslate2/     # run-time model, GPU computer only
```

The API server resolves the model from `models/buzzasr/ctranslate2` relative
to the project root. Set `BUZZASR_MODEL_DIR` to an absolute CTranslate2 model
directory when deploying the source bundle elsewhere. The model is never
downloaded automatically.

## GPU computer setup

Use the existing runtime environment with Python 3.11, Faster-Whisper 1.2.1,
CTranslate2 4.8.2, `aiohttp`, and PyAV. Set a long random API key in the
PowerShell process before starting the server:

```powershell
$env:ASR_API_KEY = "replace-with-a-long-random-secret"
$env:ASR_HOST = "127.0.0.1"       # use the Tailscale IP for remote access
$env:ASR_PORT = "8000"
$env:ASR_DATA_DIR = "E:\Python\KLTN330\asr_service_data"
$env:ASR_RETENTION_DAYS = "7"
\.venv\Scripts\python.exe -m buzzasr_bundle.package.api_server
```

For a remote backend, bind `ASR_HOST` to the GPU computer's Tailscale IP, or
use `0.0.0.0` together with a Windows Firewall rule that allows TCP 8000 only
from the backend's Tailscale IP. Do not expose this port through the router or
the public Internet. Both machines must be logged into the same Tailscale
tailnet and the access policy should allow only the backend device to reach
TCP 8000.

The server loads BuzzASR before accepting jobs. It uses CUDA FP16, Vietnamese,
beam size 5, VAD, and word-level timestamps. The GPU worker processes one job
at a time and caches the model in the process.

## HTTP contract

Every endpoint requires:

```text
Authorization: Bearer <ASR_API_KEY>
```

`GET /health` returns readiness and the number of queued/running jobs.

`POST /jobs` accepts a `multipart/form-data` request with one field named
`file`. It returns HTTP 202:

```json
{
  "job_id": "f6f8...",
  "status": "queued",
  "status_url": "http://gpu-host:8000/jobs/f6f8...",
  "result_url": "http://gpu-host:8000/jobs/f6f8.../result"
}
```

`GET /jobs/{job_id}` returns `queued`, `running`, `completed`, or `failed`.
`GET /jobs/{job_id}/result` returns the same transcript structure as the local
`transcribe_audio` function, including `segments[].words[]` with `word`,
`start`, `end`, and `probability`.

The server accepts WAV, MP3, M4A, FLAC, and OGG files up to 100 MiB and 30
minutes. It allows up to 10 unfinished jobs. Completed audio and JSON are
kept for 7 days, then removed automatically. The response never exposes the
GPU machine's absolute model, audio, or result paths.

## Backend Python client

Copy `buzzasr_bundle/client` to the backend as a package named
`buzzasr_client`, then install its one dependency:

```powershell
python -m pip install -r buzzasr_bundle\client\requirements.txt
```

Call the API without importing Faster-Whisper:

```python
from buzzasr_client.api_client import submit_audio, wait_for_result

base_url = "http://100.80.10.20:8000"  # GPU computer's Tailscale address
api_key = "replace-with-the-same-secret"

queued = submit_audio(base_url, "recordings/call_001.wav", api_key)
result = wait_for_result(base_url, queued["job_id"], api_key)

print(result["text"])
for segment in result["segments"]:
    for word in segment["words"]:
        print(word["word"], word["start"], word["end"])
```

`submit_audio` never retries a POST automatically. If polling times out, keep
the returned `job_id` and call `wait_for_result` again; the original job stays
on the server. `AsrApiError` exposes `status_code`, `code`, and `message` for
backend error handling.

## Operations and recovery

The service stores jobs in `ASR_DATA_DIR/jobs.sqlite3`. Each job has a UUID
directory with the uploaded audio and `result.json`. On restart, queued jobs
are re-enqueued; jobs that were running are marked `server_restarted`. Keep
the GPU computer awake while it is serving requests. Stop the foreground
PowerShell process with `Ctrl+C`.

The first acceptance test should run `GET /health`, submit the bundled FLEURS
sample, poll to completion, verify every word timestamp is finite and ordered,
and compare the returned text with a direct local call using the same model.
