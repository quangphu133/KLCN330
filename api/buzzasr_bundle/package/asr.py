"""Reusable local Vietnamese ASR service backed by Faster-Whisper."""

from __future__ import annotations

import gc
import json
import math
import os
<<<<<<< HEAD
import subprocess
import sys
=======
>>>>>>> 9cbf175 (Them phan quyen)
import threading
import time
from pathlib import Path
from typing import Any

from faster_whisper import WhisperModel


PACKAGE_ROOT = Path(__file__).resolve().parent
BUNDLE_ROOT = PACKAGE_ROOT.parent
PROJECT_ROOT = BUNDLE_ROOT.parent
DEFAULT_BUZZASR_MODEL_DIR = PROJECT_ROOT / "models" / "buzzasr" / "ctranslate2"
MODEL_ALIASES = {
    "large-v3": {
        "path": "large-v3",
        "source_revision": "Systran/faster-whisper-large-v3 (Hub alias)",
    },
    "buzzasr": {
        "path": str(DEFAULT_BUZZASR_MODEL_DIR),
        "source_revision": "BuzzASR/vietnamese@27af23b72c1d201b719f3c3b10864d6554895cbc",
    },
}


def _configured_buzzasr_model_dir() -> Path:
    """Return the external BuzzASR runtime directory.

    ``BUZZASR_MODEL_DIR`` is intended for deployments where the model is
    stored outside the source bundle. Relative values are rejected so a
    service cannot accidentally load a model from an unexpected working
    directory.
    """

    configured = os.environ.get("BUZZASR_MODEL_DIR")
    if not configured:
        return DEFAULT_BUZZASR_MODEL_DIR
    configured_path = Path(configured).expanduser()
    if not configured_path.is_absolute():
        raise ValueError("BUZZASR_MODEL_DIR must be an absolute path")
    return configured_path

_MODEL_LOCK = threading.Lock()
_MODEL_CACHE: WhisperModel | None = None
_MODEL_CACHE_KEY: tuple[str, str, str, str] | None = None


def resolve_model(model_name: str) -> tuple[str, str, str | None]:
    """Resolve a public alias or a local CTranslate2 model path."""

    if not model_name:
        raise ValueError("model must not be empty")

    alias = MODEL_ALIASES.get(model_name)
    if alias:
        model_path = str(_configured_buzzasr_model_dir()) if model_name == "buzzasr" else alias["path"]
        if model_name == "buzzasr" and not Path(model_path).is_dir():
            raise FileNotFoundError(
                f"BuzzASR CTranslate2 model is missing: {model_path}. "
                "Run the conversion step in README.md first."
            )
        return model_name, model_path, alias["source_revision"]

    path = Path(model_name)
    return model_name, str(path.resolve()) if path.exists() else model_name, None


def _finite_or_none(value: float | None) -> float | None:
    if value is None:
        return None
    numeric_value = float(value)
    return numeric_value if math.isfinite(numeric_value) else None


def _timestamp(seconds: float) -> str:
    milliseconds = max(0, int(round(seconds * 1000)))
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    seconds_part, milliseconds_part = divmod(remainder, 1_000)
    return f"{hours:02d}:{minutes:02d}:{seconds_part:02d},{milliseconds_part:03d}"


def _release_cached_model() -> None:
    global _MODEL_CACHE, _MODEL_CACHE_KEY
    if _MODEL_CACHE is not None:
        del _MODEL_CACHE
        _MODEL_CACHE = None
        _MODEL_CACHE_KEY = None
        gc.collect()


def _load_model(
    model_alias: str,
    model_path: str,
    device: str,
    compute_type: str,
) -> tuple[WhisperModel, float]:
    global _MODEL_CACHE, _MODEL_CACHE_KEY
    cache_key = (model_alias, model_path, device, compute_type)
    if _MODEL_CACHE is not None and _MODEL_CACHE_KEY == cache_key:
        return _MODEL_CACHE, 0.0

    _release_cached_model()
    started = time.perf_counter()
    loaded_model = WhisperModel(
        model_path,
        device=device,
        compute_type=compute_type,
    )
    _MODEL_CACHE = loaded_model
    _MODEL_CACHE_KEY = cache_key
    return loaded_model, time.perf_counter() - started


def warm_up_model(
    *,
    model: str = "buzzasr",
    device: str = "cuda",
    compute_type: str = "float16",
) -> float:
    """Load and cache a model without transcribing an audio file."""

    if device not in {"cuda", "cpu"}:
        raise ValueError("device must be 'cuda' or 'cpu'")
    if not compute_type:
        raise ValueError("compute_type must not be empty")
    model_alias, model_path, _ = resolve_model(model)
    with _MODEL_LOCK:
        _, load_seconds = _load_model(model_alias, model_path, device, compute_type)
    return load_seconds


def _write_outputs(result: dict[str, Any], output_dir: Path, stem: str) -> dict[str, str]:
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = (output_dir / f"{stem}.json").resolve()
    txt_path = (output_dir / f"{stem}.txt").resolve()
    srt_path = (output_dir / f"{stem}.srt").resolve()

    txt_lines = [
        f"[{_timestamp(segment['start']).replace(',', '.')} -> "
        f"{_timestamp(segment['end']).replace(',', '.')}] {segment['text']}"
        for segment in result["segments"]
    ]
    srt_blocks = [
        f"{index}\n{_timestamp(segment['start'])} --> "
        f"{_timestamp(segment['end'])}\n{segment['text']}"
        for index, segment in enumerate(result["segments"], start=1)
    ]
    files = {
        "json": str(json_path),
        "txt": str(txt_path),
        "srt": str(srt_path),
    }
    result["files"] = files
    json_path.write_text(
        json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False),
        encoding="utf-8",
    )
    txt_path.write_text("\n".join(txt_lines) + "\n", encoding="utf-8")
    srt_path.write_text("\n\n".join(srt_blocks) + "\n", encoding="utf-8")
    return files


def transcribe_audio(
    audio_path: str | Path,
    *,
    model: str = "buzzasr",
    device: str = "cuda",
    compute_type: str = "float16",
    language: str = "vi",
    beam_size: int = 5,
    output_dir: str | Path | None = None,
<<<<<<< HEAD
    enable_diarization: bool = False,
    diarization_model: str = "pyannote/speaker-diarization-community-1",
    diarization_token: str | None = None,
    diarization_device: str | None = None,
    diarization_python: str | None = None,
=======
>>>>>>> 9cbf175 (Them phan quyen)
) -> dict[str, Any]:
    """Transcribe one local audio file and return text plus word timestamps.

    The model is cached per process and configuration. Model loading and
    inference are serialized so multiple Back-end calls cannot overlap on the
    same GPU model. Waiting for the lock and writing optional files are not
    included in ``processing_seconds``.
    """

    if device not in {"cuda", "cpu"}:
        raise ValueError("device must be 'cuda' or 'cpu'")
    if not compute_type:
        raise ValueError("compute_type must not be empty")
    if not language:
        raise ValueError("language must not be empty")
    if not isinstance(beam_size, int) or beam_size < 1:
        raise ValueError("beam_size must be a positive integer")

    audio = Path(audio_path)
    if not audio.is_file():
        raise FileNotFoundError(f"Input audio does not exist: {audio}")

    model_alias, model_path, source_revision = resolve_model(model)
    with _MODEL_LOCK:
        loaded_model, model_load_seconds = _load_model(
            model_alias,
            model_path,
            device,
            compute_type,
        )
        transcription_started = time.perf_counter()
        segments_iter, info = loaded_model.transcribe(
            str(audio),
            language=language,
            task="transcribe",
            beam_size=beam_size,
            temperature=0.0,
            condition_on_previous_text=False,
            word_timestamps=True,
            vad_filter=True,
            vad_parameters={
                "min_silence_duration_ms": 500,
                "speech_pad_ms": 400,
            },
        )

        segments: list[dict[str, Any]] = []
        words_with_timestamps = 0
        words_without_timestamps = 0
        for segment in segments_iter:
            word_items: list[dict[str, Any]] = []
            for word in segment.words or []:
                start = _finite_or_none(word.start)
                end = _finite_or_none(word.end)
                if start is not None and end is not None and end >= start:
                    words_with_timestamps += 1
                else:
                    words_without_timestamps += 1
                word_items.append(
                    {
                        "word": word.word,
                        "start": start,
                        "end": end,
                        "probability": _finite_or_none(word.probability),
                    }
                )
            segments.append(
                {
                    "id": int(segment.id),
                    "start": float(segment.start),
                    "end": float(segment.end),
                    "text": segment.text.strip(),
                    "avg_logprob": _finite_or_none(segment.avg_logprob),
                    "no_speech_prob": _finite_or_none(segment.no_speech_prob),
                    "words": word_items,
                }
            )
        inference_seconds = time.perf_counter() - transcription_started

    duration = float(info.duration)
    result: dict[str, Any] = {
        "source": str(audio.resolve()),
        "model": model_alias,
        "model_path": model_path,
        "model_source_revision": source_revision,
        "device": device,
        "compute_type": compute_type,
        "language_requested": language,
        "language_detected": info.language,
        "language_probability": _finite_or_none(info.language_probability),
        "duration_seconds": duration,
        "duration_after_vad_seconds": _finite_or_none(info.duration_after_vad),
        "model_load_seconds": model_load_seconds,
        "inference_seconds": inference_seconds,
        "processing_seconds": model_load_seconds + inference_seconds,
        "real_time_factor": inference_seconds / duration if duration > 0 else None,
        "word_timestamp_count": words_with_timestamps,
        "word_without_timestamp_count": words_without_timestamps,
        "text": " ".join(segment["text"] for segment in segments),
        "segments": segments,
        "files": None,
    }

<<<<<<< HEAD
    if enable_diarization:
        target_device = diarization_device or device
        try:
            try:
                from .diarization import diarize_audio, failed_diarization, DiarizationError
            except ImportError:
                from diarization import diarize_audio, failed_diarization, DiarizationError
            request = {
                "audio_path": str(audio), "model": diarization_model, "token": diarization_token,
                "device": target_device, "segments": segments,
            }
            if diarization_python and Path(diarization_python).is_file() and Path(diarization_python).resolve() != Path(sys.executable).resolve():
                worker = PACKAGE_ROOT / "diarization_worker.py"
                completed = subprocess.run(
                    [diarization_python, str(worker)], input=json.dumps(request), capture_output=True,
                    text=True, encoding="utf-8", timeout=60 * 60,
                )
                if completed.returncode != 0:
                    raise DiarizationError("inference_failed", completed.stderr.strip() or "Diarization worker failed.")
                try:
                    diarization = json.loads(completed.stdout)
                except json.JSONDecodeError as error:
                    raise DiarizationError("inference_failed", f"Invalid diarization worker response: {error}") from error
            else:
                diarization = diarize_audio(**request)
            if target_device == "cuda" and diarization.get("status") == "failed":
                diarization["fallback_from_device"] = "cuda"
        except DiarizationError as error:
            if target_device == "cuda" and error.code == "inference_failed":
                try:
                    request["device"] = "cpu"
                    if diarization_python and Path(diarization_python).is_file() and Path(diarization_python).resolve() != Path(sys.executable).resolve():
                        completed = subprocess.run(
                            [diarization_python, str(worker)], input=json.dumps(request), capture_output=True,
                            text=True, encoding="utf-8", timeout=60 * 60,
                        )
                        if completed.returncode != 0:
                            raise DiarizationError("inference_failed", completed.stderr.strip() or "Diarization worker failed.")
                        try:
                            diarization = json.loads(completed.stdout)
                        except json.JSONDecodeError as error:
                            raise DiarizationError("inference_failed", f"Invalid diarization worker response: {error}") from error
                    else:
                        diarization = diarize_audio(**request)
                    diarization["fallback_from_device"] = "cuda"
                except DiarizationError as fallback_error:
                    diarization = failed_diarization(
                        fallback_error.code,
                        fallback_error.message,
                        model=diarization_model,
                        device="cpu",
                    )
                    diarization["fallback_from_device"] = "cuda"
            else:
                diarization = failed_diarization(
                    error.code,
                    error.message,
                    model=diarization_model,
                    device=target_device,
                )
    else:
        diarization = {
            "status": "disabled",
            "model": diarization_model,
            "device": diarization_device or device,
            "processing_seconds": 0.0,
            "speaker_count": 0,
            "speakers": [],
            "turns": [],
            "utterances": [],
            "role_mapping": {
                "status": "needs_confirmation",
                "suggested_agent_speaker_id": None,
                "suggestion_reason": None,
            },
            "segments": [],
        }
    result["diarization"] = diarization

=======
>>>>>>> 9cbf175 (Them phan quyen)
    if output_dir is not None:
        result["files"] = _write_outputs(result, Path(output_dir), audio.stem)

    return result


def _reset_model_cache_for_tests() -> None:
    """Release the process cache; intended for tests and controlled shutdown."""

    with _MODEL_LOCK:
        _release_cached_model()
