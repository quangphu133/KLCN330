from __future__ import annotations

import json
import os
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from buzzasr_bundle.package import asr


class FakeWhisperModel:
    created = 0
    active = 0
    max_active = 0
    silent = False
    state_lock = threading.Lock()

    def __init__(self, path: str, *, device: str, compute_type: str) -> None:
        type(self).created += 1
        self.path = path
        self.device = device
        self.compute_type = compute_type

    def transcribe(self, audio: str, **kwargs):
        del audio, kwargs

        def generate():
            with type(self).state_lock:
                type(self).active += 1
                type(self).max_active = max(type(self).max_active, type(self).active)
            try:
                time.sleep(0.02)
                if type(self).silent:
                    return
                yield SimpleNamespace(
                    id=0,
                    start=0.0,
                    end=1.0,
                    text="xin chào",
                    avg_logprob=float("nan"),
                    no_speech_prob=0.0,
                    words=[
                        SimpleNamespace(word="xin", start=0.0, end=0.4, probability=float("nan")),
                        SimpleNamespace(word="chào", start=0.4, end=1.0, probability=0.99),
                    ],
                )
            finally:
                with type(self).state_lock:
                    type(self).active -= 1

        return generate(), SimpleNamespace(
            duration=1.0,
            duration_after_vad=1.0,
            language="vi",
            language_probability=1.0,
        )


class AsrFunctionTests(unittest.TestCase):
    def setUp(self) -> None:
        FakeWhisperModel.created = 0
        FakeWhisperModel.active = 0
        FakeWhisperModel.max_active = 0
        FakeWhisperModel.silent = False
        self.patch_model = patch.object(asr, "WhisperModel", FakeWhisperModel)
        self.patch_model.start()
        asr._reset_model_cache_for_tests()
        self.temp_dir = tempfile.TemporaryDirectory()
        self.audio = Path(self.temp_dir.name) / "call.wav"
        self.audio.write_bytes(b"test audio")

    def tearDown(self) -> None:
        asr._reset_model_cache_for_tests()
        self.patch_model.stop()
        self.temp_dir.cleanup()

    def test_reuses_model_and_returns_no_files_by_default(self) -> None:
        first = asr.transcribe_audio(self.audio, model="test-model")
        second = asr.transcribe_audio(self.audio, model="test-model")

        self.assertEqual(FakeWhisperModel.created, 1)
        self.assertGreater(first["model_load_seconds"], 0)
        self.assertEqual(second["model_load_seconds"], 0.0)
        self.assertEqual(first["text"], "xin chào")
        self.assertIsNone(first["files"])
        self.assertEqual(first["word_timestamp_count"], 2)
        self.assertEqual(first["word_without_timestamp_count"], 0)

    def test_writes_three_files_and_json_has_no_nan(self) -> None:
        output_dir = Path(self.temp_dir.name) / "output"
        result = asr.transcribe_audio(self.audio, model="test-model", output_dir=output_dir)

        self.assertEqual(set(result["files"]), {"json", "txt", "srt"})
        for path in result["files"].values():
            self.assertTrue(Path(path).is_file())
        saved = json.loads(Path(result["files"]["json"]).read_text(encoding="utf-8"))
        self.assertIsNone(saved["segments"][0]["words"][0]["probability"])
        json.dumps(saved, allow_nan=False)

    def test_missing_audio_and_invalid_parameters_raise(self) -> None:
        with self.assertRaises(FileNotFoundError):
            asr.transcribe_audio(Path(self.temp_dir.name) / "missing.wav", model="test-model")
        with self.assertRaises(ValueError):
            asr.transcribe_audio(self.audio, model="test-model", beam_size=0)
        with self.assertRaises(ValueError):
            asr.transcribe_audio(self.audio, model="test-model", device="gpu")

    def test_concurrent_calls_are_serialized(self) -> None:
        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(
                executor.map(
                    lambda _: asr.transcribe_audio(self.audio, model="test-model"),
                    range(2),
                )
            )
        self.assertEqual(len(results), 2)
        self.assertEqual(FakeWhisperModel.max_active, 1)

    def test_model_configuration_change_reloads_and_silence_is_empty(self) -> None:
        asr.transcribe_audio(self.audio, model="test-model", device="cuda")
        reloaded = asr.transcribe_audio(self.audio, model="test-model", device="cpu")
        self.assertEqual(FakeWhisperModel.created, 2)
        self.assertGreater(reloaded["model_load_seconds"], 0)

        FakeWhisperModel.silent = True
        silent = asr.transcribe_audio(self.audio, model="test-model", device="cpu")
        self.assertEqual(silent["text"], "")
        self.assertEqual(silent["segments"], [])
        self.assertEqual(silent["word_timestamp_count"], 0)

    def test_external_model_directory_override_requires_absolute_path(self) -> None:
        with patch.dict(os.environ, {"BUZZASR_MODEL_DIR": self.temp_dir.name}):
            alias, path, _ = asr.resolve_model("buzzasr")
            self.assertEqual(alias, "buzzasr")
            self.assertEqual(Path(path), Path(self.temp_dir.name))
        with patch.dict(os.environ, {"BUZZASR_MODEL_DIR": "relative-model"}):
            with self.assertRaises(ValueError):
                asr.resolve_model("buzzasr")


if __name__ == "__main__":
    unittest.main()
