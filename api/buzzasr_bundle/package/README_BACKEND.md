# Backend integration guide

When the backend starts from the project root, import the local ASR function
from the bundle package:

```python
from buzzasr_bundle.package.asr import transcribe_audio
```

If the backend adds `buzzasr_bundle/package` to its Python import path, the
short form `from asr import transcribe_audio` is equivalent. The examples
below use the project-root import so they work without changing `sys.path`.

The default model is the converted Vietnamese BuzzASR checkpoint at
`models/buzzasr/ctranslate2`, outside this source bundle. Set
`BUZZASR_MODEL_DIR` to an absolute model directory when the model is stored
elsewhere. The function runs locally with Faster-Whisper
on CUDA and returns word-level timestamps. No audio is uploaded to a remote
service.

## Environment

Run the backend with the project `.venv` environment. The working setup uses
Python 3.11, Faster-Whisper 1.2.1, CTranslate2 4.8.2, CUDA FP16, and an RTX
3060 with 12 GB VRAM. The BuzzASR model must already have been converted as
described in the bundle README.

Keep one GPU ASR process. The module caches the model after the first call;
later calls with the same `(model, device, compute_type)` reuse it. Calls in
the same process are serialized so two requests do not run inference on the
same GPU model concurrently.

## CPU-only backend

An NVIDIA GPU is not required. On a backend machine without a GPU, select the
CPU explicitly and use an integer compute type:

```python
from buzzasr_bundle.package.asr import transcribe_audio

result = transcribe_audio(
    "recordings/call_001.wav",
    device="cpu",
    compute_type="int8",
)
```

The equivalent command-line invocation is:

```powershell
python -m buzzasr_bundle.package.transcribe_sample `
  recordings\call_001.wav --device cpu --compute-type int8 `
  --output-dir outputs\call_001
```

CPU inference uses system RAM and is normally slower than CUDA FP16. Keep one
ASR process, allow enough RAM for the large-v3 model, and benchmark the real
call duration before setting an API timeout. The bundle currently contains the
FP16 runtime model used by the RTX deployment. If the installed CTranslate2
build rejects `compute_type="int8"` for that model, create a separate CPU
runtime conversion with `--quantization int8` and point `model` to that local
directory; do not silently switch back to CUDA or another model.

If CPU latency is not acceptable, keep this backend process CPU-only and run a
separate ASR worker on the GPU machine. The backend can enqueue the audio and
read the JSON result, while the GPU worker runs this same function with
`device="cuda"` and `compute_type="float16"`.

## Function signature

```python
def transcribe_audio(
    audio_path: str | Path,
    *,
    model: str = "buzzasr",
    device: str = "cuda",
    compute_type: str = "float16",
    language: str = "vi",
    beam_size: int = 5,
    output_dir: str | Path | None = None,
) -> dict:
    ...
```

`audio_path` is a local audio file. `model` accepts `"buzzasr"`,
`"large-v3"`, or a local CTranslate2 model directory. `device`,
`compute_type`, `language`, and `beam_size` control inference. `output_dir`
is optional: when omitted, no output files are created; when supplied, the
function writes JSON, TXT, and SRT files using the audio stem.

## Basic call

```python
from buzzasr_bundle.package.asr import transcribe_audio

result = transcribe_audio("recordings/call_001.wav")

print(result["text"])

for segment in result["segments"]:
    for word in segment["words"]:
        print(word["word"], word["start"], word["end"])
```

The timestamp values are seconds from the start of the audio. Each word also
contains a probability when Faster-Whisper provides one.

## Save files for a call

Use a separate directory for each call ID to avoid overwriting files with the
same audio filename:

```python
result = transcribe_audio(
    "recordings/call_001.wav",
    output_dir="outputs/call_001",
)

print(result["files"])
# {
#   "json": ".../outputs/call_001/call_001.json",
#   "txt": ".../outputs/call_001/call_001.txt",
#   "srt": ".../outputs/call_001/call_001.srt"
# }
```

The JSON file contains the same dictionary returned by the function, including
`text`, `segments`, timestamps, model information, timing, and the `files`
object. The TXT and SRT files contain segment-level text and timestamps.

## Result structure

```python
result["text"]                         # complete transcript
result["segments"]                     # ordered transcript segments
result["segments"][0]["words"]        # word-level items
result["segments"][0]["words"][0]["start"]
result["segments"][0]["words"][0]["end"]
result["word_timestamp_count"]
result["word_without_timestamp_count"]
result["model_load_seconds"]
result["inference_seconds"]
result["processing_seconds"]
result["real_time_factor"]
result["files"]                         # None when output_dir is omitted
```

`language_probability` describes the requested language detection result. It
is not a confidence score for the transcript.

## Error handling and silence

```python
from pathlib import Path
from buzzasr_bundle.package.asr import transcribe_audio

try:
    result = transcribe_audio(Path("recordings/call_001.wav"))
except FileNotFoundError:
    # Return a client error or mark the recording as unavailable.
    result = None
except ValueError as error:
    # Invalid device, language, beam size, or another input parameter.
    print(f"Invalid ASR request: {error}")
```

Decode, CUDA, and model errors are propagated to the backend with their
original cause. The function does not silently change to CPU or another model.
For a valid audio file with no detected speech, the result has
`text == ""`, `segments == []`, and zero word timestamps.

## Calling from async backend code

Faster-Whisper inference is synchronous. Run it in a worker thread so an async
request loop remains responsive:

```python
import asyncio

from buzzasr_bundle.package.asr import transcribe_audio


async def transcribe_for_request(audio_path: str, call_id: str) -> dict:
    return await asyncio.to_thread(
        transcribe_audio,
        audio_path,
        output_dir=f"outputs/{call_id}",
    )
```

The module serializes calls inside the process. If higher throughput is needed,
measure GPU memory before introducing additional GPU processes because each
process can load another model copy.

## Use the V3 baseline

To compare against the original multilingual checkpoint, select it explicitly:

```python
baseline = transcribe_audio(
    "recordings/call_001.wav",
    model="large-v3",
)
```

The default remains BuzzASR for Vietnamese recognition.

## Quick local check

From the project directory:

```powershell
 .\.venv\Scripts\python.exe -m buzzasr_bundle.package.transcribe_sample `
  samples\fleurs_vi_test.wav --output-dir outputs\backend_smoke
 .\.venv\Scripts\python.exe buzzasr_bundle\package\validate_smoke_test.py `
  samples\fleurs_vi_test.json outputs\backend_smoke\fleurs_vi_test.json
```

The check should report matching transcript words and valid monotonic
timestamps for every word. The FLEURS audio is a smoke test; it does not
replace an evaluation on an independently labelled call-center dataset.

For a backend that does not store the model, use the remote GPU API and the
client documented in [README_API.md](../README_API.md). The backend should
copy only `buzzasr_bundle/client`, rename it to `buzzasr_client`, and call
`submit_audio()` followed by `wait_for_result()`.

## Speaker diarization

Install the optional diarization dependencies in a separate environment:

```powershell
python -m pip install -r buzzasr_bundle\package\requirements-diarization.txt
```

Accept the `pyannote/speaker-diarization-community-1` model conditions and set
`HF_TOKEN` on the ASR machine. The API enables diarization by default; set
`ASR_ENABLE_DIARIZATION=false` to keep the transcript-only behavior. Use
`ASR_DIARIZATION_DEVICE=cpu` when CUDA memory is unavailable. The result JSON
keeps the original ASR segments and adds `diarization.utterances`, speaker
turns, and a role suggestion. Missing dependencies or model errors produce a
`diarization.status` of `failed` while preserving the ASR transcript.
Set `ASR_DIARIZATION_PYTHON` to the dedicated environment executable (for
example `.venv-diarization\\Scripts\\python.exe`). The API invokes a local
worker subprocess and does not create a second network service. On Windows, set
`ASR_FFMPEG_BIN` to the `bin` directory from an FFmpeg shared build so
TorchCodec can load its FFmpeg DLLs inside the diarization worker.
