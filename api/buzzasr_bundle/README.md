# BuzzASR deployment bundle

This directory contains the ASR code, the remote GPU API, and the backend
client. The BuzzASR weights are deliberately stored outside the bundle in
`models/buzzasr` so source code can be shared without copying the model.

```text
buzzasr_bundle/
├── package/
│   ├── asr.py               # local transcribe_audio function
│   ├── api_server.py        # HTTP job API for the GPU computer
│   ├── transcribe_sample.py
│   ├── README_BACKEND.md    # local Python integration
│   └── tests/
├── client/
│   ├── api_client.py        # backend-only remote client
│   └── requirements.txt
├── README.md
└── README_API.md            # GPU operator and API contract

models/buzzasr/
├── ctranslate2/             # required runtime checkpoint
├── source/                   # optional source checkpoint for reproduction
└── MODEL_METADATA.json
```

## Local function

From the project root, import the function with:

```python
from buzzasr_bundle.package.asr import transcribe_audio

result = transcribe_audio("samples/fleurs_vi_test.wav")
print(result["text"])
```

The default BuzzASR path is calculated from the project root. For a separately
stored model, set `BUZZASR_MODEL_DIR` to an absolute path containing the
CTranslate2 files. The function keeps its existing word-level timestamps,
JSON/TXT/SRT output, and `large-v3` baseline option.

## Run the local CLI

```powershell
.\.venv\Scripts\python.exe -m buzzasr_bundle.package.transcribe_sample `
  samples\fleurs_vi_test.wav --output-dir outputs\bundle_smoke
```

## Run the remote GPU API

The API runs on the RTX 3060 computer and keeps the model private:

```powershell
$env:ASR_API_KEY = "replace-with-a-long-random-secret"
$env:ASR_HOST = "127.0.0.1"
$env:ASR_PORT = "8000"
.\.venv\Scripts\python.exe -m buzzasr_bundle.package.api_server
```

Use the Tailscale address as `ASR_HOST` only when the backend is on another
machine. Follow [README_API.md](README_API.md) for the full Tailscale setup,
API contract, retention policy, and Python client example.

## Environments

The GPU runtime uses the existing project `.venv` with Python 3.11,
Faster-Whisper 1.2.1, CTranslate2 4.8.2, `aiohttp`, and PyAV. The backend
machine needs only Python and `client/requirements.txt`; it does not need
Faster-Whisper, CUDA, or the model.

The source checkpoint is pinned to the revision recorded in
`models/buzzasr/MODEL_METADATA.json`. The runtime model is not downloaded
automatically. Do not delete `models/buzzasr/ctranslate2` on the GPU computer.

## CPU-only local mode

If the API is not used and a backend must run locally without an NVIDIA GPU:

```python
from buzzasr_bundle.package.asr import transcribe_audio

result = transcribe_audio(
    "recordings/call_001.wav",
    device="cpu",
    compute_type="int8",
)
```
