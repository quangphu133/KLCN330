from __future__ import annotations

import asyncio
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch

from aiohttp import FormData
from aiohttp.test_utils import TestClient, TestServer

from buzzasr_bundle.package import api_server


def write_test_wav(path: Path) -> None:
    with wave.open(str(path), "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(16000)
        audio.writeframes(b"\x00\x00" * 16000)


class ApiServerTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.settings = api_server.Settings(
            api_key="test-secret",
            host="127.0.0.1",
            port=8000,
            data_dir=Path(self.temp_dir.name),
            max_file_bytes=1024 * 1024,
            max_audio_seconds=60,
            max_pending_jobs=2,
            retention_days=7,
        )

        def fake_transcribe(audio_path, **kwargs):
            del audio_path, kwargs
            return {
                "source": "internal.wav",
                "model": "buzzasr",
                "model_path": "internal-path",
                "device": "cuda",
                "compute_type": "float16",
                "language_requested": "vi",
                "language_detected": "vi",
                "language_probability": 1.0,
                "duration_seconds": 1.0,
                "duration_after_vad_seconds": 1.0,
                "model_load_seconds": 0.0,
                "inference_seconds": 0.01,
                "processing_seconds": 0.01,
                "real_time_factor": 0.01,
                "word_timestamp_count": 1,
                "word_without_timestamp_count": 0,
                "text": "xin chào",
                "segments": [{
                    "id": 0,
                    "start": 0.0,
                    "end": 1.0,
                    "text": "xin chào",
                    "avg_logprob": -0.1,
                    "no_speech_prob": 0.0,
                    "words": [{"word": "xin chào", "start": 0.0, "end": 1.0, "probability": 0.99}],
                }],
                "files": None,
            }

        self.warm_patch = patch.object(api_server, "warm_up_model", return_value=0.01)
        self.transcribe_patch = patch.object(api_server, "transcribe_audio", side_effect=fake_transcribe)
        self.warm_patch.start()
        self.transcribe_patch.start()
        self.server = TestServer(api_server.create_app(self.settings))
        self.client = TestClient(self.server)
        await self.client.start_server()

    async def asyncTearDown(self) -> None:
        await self.client.close()
        await self.server.close()
        self.warm_patch.stop()
        self.transcribe_patch.stop()
        self.temp_dir.cleanup()

    async def test_requires_authentication(self) -> None:
        response = await self.client.get("/health")
        self.assertEqual(response.status, 401)

    async def test_submit_poll_and_result(self) -> None:
        audio_path = Path(self.temp_dir.name) / "call.wav"
        write_test_wav(audio_path)
        headers = {"Authorization": "Bearer test-secret"}
        form = FormData()
        form.add_field("file", audio_path.read_bytes(), filename=audio_path.name, content_type="audio/wav")
        response = await self.client.post(
            "/jobs",
            headers=headers,
            data=form,
        )
        self.assertEqual(response.status, 202)
        queued = await response.json()
        self.assertIn("job_id", queued)

        result = None
        for _ in range(30):
            status_response = await self.client.get(
                f"/jobs/{queued['job_id']}", headers=headers
            )
            status = await status_response.json()
            if status["status"] == "completed":
                result_response = await self.client.get(
                    f"/jobs/{queued['job_id']}/result", headers=headers
                )
                result = await result_response.json()
                break
            await asyncio.sleep(0.01)
        self.assertIsNotNone(result)
        self.assertEqual(result["text"], "xin chào")
        self.assertNotIn("model_path", result)
        self.assertEqual(result["source"], audio_path.name)


if __name__ == "__main__":
    unittest.main()
