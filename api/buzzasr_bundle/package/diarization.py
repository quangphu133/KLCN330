"""Optional local speaker diarization and ASR timestamp alignment."""

from __future__ import annotations

import re
import time
from pathlib import Path
from typing import Any


DEFAULT_DIARIZATION_MODEL = "pyannote/speaker-diarization-community-1"


class DiarizationError(RuntimeError):
    """A recoverable diarization error that must not discard ASR output."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def _overlap(start: float, end: float, other_start: float, other_end: float) -> float:
    return max(0.0, min(end, other_end) - max(start, other_start))


def _speaker_for_interval(
    start: Any,
    end: Any,
    turns: list[dict[str, Any]],
) -> str:
    if start is None or end is None:
        return "unknown"
    try:
        word_start = float(start)
        word_end = float(end)
    except (TypeError, ValueError):
        return "unknown"
    if word_end <= word_start:
        return "unknown"

    candidates = [
        (
            _overlap(word_start, word_end, turn["start"], turn["end"]),
            turn["speaker_id"],
        )
        for turn in turns
    ]
    candidates = [item for item in candidates if item[0] > 0]
    if not candidates:
        return "unknown"
    candidates.sort(reverse=True)
    best_overlap, best_speaker = candidates[0]
    if best_overlap / (word_end - word_start) <= 0.5:
        return "unknown"
    if len(candidates) > 1 and candidates[1][0] == best_overlap:
        return "unknown"
    return str(best_speaker)


def _suggest_agent_role(utterances: list[dict[str, Any]], speakers: list[str]) -> dict[str, Any]:
    """Suggest a role only when one speaker has unique call-center evidence."""
    if len(speakers) != 2:
        return {
            "status": "needs_confirmation",
            "suggested_agent_speaker_id": None,
            "suggestion_reason": None,
        }
    hints = [
        re.compile(r"(?:em|tôi)\s+(?:là|gọi|đến từ|bên)", re.IGNORECASE),
        re.compile(r"(?:tư vấn|hỗ trợ|chăm sóc|tổng đài|công ty)", re.IGNORECASE),
    ]
    scores = {speaker: 0 for speaker in speakers}
    evidence: dict[str, str] = {}
    for utterance in utterances:
        if utterance.get("start") is None or float(utterance["start"]) >= 60 or utterance["speaker_id"] not in scores:
            continue
        text = utterance["text"]
        matches = sum(bool(pattern.search(text)) for pattern in hints)
        if matches:
            speaker = utterance["speaker_id"]
            scores[speaker] += matches
            evidence.setdefault(speaker, text)

    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    if len([speaker for speaker, score in ranked if score > 0]) != 1:
        return {
            "status": "needs_confirmation",
            "suggested_agent_speaker_id": None,
            "suggestion_reason": None,
        }
    speaker, score = ranked[0]
    return {
        "status": "suggested",
        "suggested_agent_speaker_id": speaker,
        "suggestion_reason": evidence.get(speaker),
        "suggestion_score": score,
    }


def _iter_diarization_turns(annotation: Any) -> list[dict[str, Any]]:
    turns: list[dict[str, Any]] = []
    for turn, _, label in annotation.itertracks(yield_label=True):
        turns.append(
            {
                "speaker_id": str(label),
                "start": round(float(turn.start), 3),
                "end": round(float(turn.end), 3),
            }
        )
    return sorted(turns, key=lambda item: (item["start"], item["end"]))


def _align_segments(
    segments: list[dict[str, Any]],
    turns: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    enriched: list[dict[str, Any]] = []
    utterances: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    for segment in segments:
        copied = dict(segment)
        assigned_words: list[dict[str, Any]] = []
        for word in segment.get("words", []) or []:
            copied_word = dict(word)
            speaker_id = _speaker_for_interval(word.get("start"), word.get("end"), turns)
            copied_word["speaker_id"] = speaker_id
            assigned_words.append(copied_word)
            word_text = str(word.get("word", "")).strip()
            if not word_text:
                continue
            if word.get("start") is None or word.get("end") is None:
                item = {
                    "speaker_id": "unknown",
                    "start": None,
                    "end": None,
                    "word": word_text,
                    "text": word_text,
                }
                if current and current["speaker_id"] == "unknown" and current["start"] is None:
                    current["text"] = f"{current['text']} {word_text}".strip()
                    current.setdefault("words", []).append(item)
                else:
                    current = {**item, "words": [item]}
                    utterances.append(current)
                continue
            item = {
                "speaker_id": speaker_id,
                "start": float(word["start"]),
                "end": float(word["end"]),
                "word": word_text,
                "text": word_text,
            }
            if current and current["speaker_id"] == speaker_id and item["start"] - current["end"] < 1.5:
                current["text"] = f"{current['text']} {word_text}".strip()
                current["end"] = item["end"]
                current.setdefault("words", []).append(item)
            else:
                current = {**item, "words": [item]}
                utterances.append(current)

        copied["words"] = assigned_words
        segment_speakers = {word["speaker_id"] for word in assigned_words if word["speaker_id"] != "unknown"}
        copied["speaker_id"] = next(iter(segment_speakers)) if len(segment_speakers) == 1 else "unknown"
        copied["speaker"] = copied["speaker_id"]
        enriched.append(copied)
    return enriched, utterances


def _load_audio_waveform(audio_path: str | Path, torch: Any) -> dict[str, Any]:
    """Decode any BuzzASR-supported audio file into mono 16 kHz samples."""
    try:
        import av
    except ImportError as error:
        raise DiarizationError("dependency_missing", "PyAV is required to decode audio for diarization.") from error
    import numpy as np

    chunks: list[np.ndarray] = []
    try:
        with av.open(str(audio_path)) as container:
            stream = next(iter(container.streams.audio), None)
            if stream is None:
                raise DiarizationError("audio_decode_failed", "The input file has no audio stream.")
            resampler = av.audio.resampler.AudioResampler(format="fltp", layout="mono", rate=16000)
            for frame in container.decode(stream):
                for resampled in resampler.resample(frame):
                    samples = resampled.to_ndarray()
                    chunks.append(np.asarray(samples, dtype=np.float32).reshape(-1))
    except DiarizationError:
        raise
    except Exception as error:
        raise DiarizationError("audio_decode_failed", str(error)) from error
    if not chunks:
        raise DiarizationError("audio_decode_failed", "The input file contains no decodable audio samples.")
    waveform = np.concatenate(chunks).astype(np.float32, copy=False)
    return {"waveform": torch.from_numpy(waveform).unsqueeze(0), "sample_rate": 16000}


def diarize_audio(
    audio_path: str | Path,
    *,
    model: str = DEFAULT_DIARIZATION_MODEL,
    token: str | None = None,
    device: str = "cuda",
    segments: list[dict[str, Any]],
) -> dict[str, Any]:
    """Run pyannote and align ASR words to the detected speaker turns."""
    started = time.perf_counter()
    try:
        import torch
        from pyannote.audio import Pipeline
    except ImportError as error:
        raise DiarizationError(
            "dependency_missing",
            "pyannote.audio and torch are required for diarization.",
        ) from error

    try:
        kwargs = {"token": token} if token else {}
        pipeline = Pipeline.from_pretrained(model, **kwargs)
        pipeline.to(torch.device(device))
        output = pipeline(_load_audio_waveform(audio_path, torch))
        annotation = getattr(output, "exclusive_speaker_diarization", None)
        if annotation is None:
            annotation = getattr(output, "speaker_diarization", None)
        if annotation is None:
            raise DiarizationError("no_diarization", "The diarization model returned no speaker turns.")
        turns = _iter_diarization_turns(annotation)
    except DiarizationError:
        raise
    except Exception as error:
        raise DiarizationError("inference_failed", str(error)) from error

    speakers = sorted({turn["speaker_id"] for turn in turns})
    enriched_segments, utterances = _align_segments(segments, turns)
    status = "completed" if len(speakers) == 2 else "unsupported_speaker_count"
    result: dict[str, Any] = {
        "status": status,
        "model": model,
        "device": device,
        "processing_seconds": round(time.perf_counter() - started, 3),
        "speaker_count": len(speakers),
        "speakers": [{"speaker_id": speaker, "role": None} for speaker in speakers],
        "turns": turns,
        "utterances": utterances,
        "role_mapping": _suggest_agent_role(utterances, speakers),
        "segments": enriched_segments,
    }
    return result


def failed_diarization(code: str, message: str, *, model: str, device: str) -> dict[str, Any]:
    return {
        "status": "failed",
        "model": model,
        "device": device,
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
        "error": {"code": code, "message": message},
    }
