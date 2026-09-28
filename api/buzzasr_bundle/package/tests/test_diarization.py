import unittest

from buzzasr_bundle.package.diarization import (
    _align_segments,
    _speaker_for_interval,
    _suggest_agent_role,
)


class DiarizationHelperTests(unittest.TestCase):
    def setUp(self) -> None:
        self.turns = [
            {"speaker_id": "SPEAKER_00", "start": 0.0, "end": 2.0},
            {"speaker_id": "SPEAKER_01", "start": 2.0, "end": 4.0},
        ]

    def test_assigns_only_when_one_turn_has_more_than_half_overlap(self) -> None:
        self.assertEqual(_speaker_for_interval(0.1, 0.8, self.turns), "SPEAKER_00")
        self.assertEqual(_speaker_for_interval(0.5, 3.5, self.turns), "unknown")
        self.assertEqual(_speaker_for_interval(None, 1.0, self.turns), "unknown")

    def test_aligns_words_and_merges_same_speaker_utterances(self) -> None:
        segments, utterances = _align_segments(
            [
                {
                    "start": 0.0,
                    "end": 3.0,
                    "text": "xin chào bạn",
                    "words": [
                        {"word": "xin", "start": 0.1, "end": 0.5},
                        {"word": "chào", "start": 0.5, "end": 0.9},
                        {"word": "bạn", "start": 2.2, "end": 2.8},
                    ],
                }
            ],
            self.turns,
        )
        self.assertEqual([item["speaker_id"] for item in utterances], ["SPEAKER_00", "SPEAKER_01"])
        self.assertEqual(segments[0]["words"][0]["speaker_id"], "SPEAKER_00")
        self.assertEqual(segments[0]["speaker_id"], "unknown")

    def test_missing_timestamps_are_retained_without_audio_regions(self) -> None:
        _, utterances = _align_segments(
            [{"words": [{"word": "thiếu"}, {"word": "thời gian"}]}],
            self.turns,
        )
        self.assertEqual(utterances[0]["text"], "thiếu thời gian")
        self.assertEqual(utterances[0]["speaker_id"], "unknown")
        self.assertIsNone(utterances[0]["start"])

    def test_role_suggestion_requires_unique_call_center_evidence(self) -> None:
        suggestion = _suggest_agent_role(
            [{"speaker_id": "SPEAKER_00", "start": 1.0, "end": 3.0, "text": "Em gọi từ công ty để tư vấn ạ"}],
            ["SPEAKER_00", "SPEAKER_01"],
        )
        self.assertEqual(suggestion["suggested_agent_speaker_id"], "SPEAKER_00")
        self.assertEqual(
            _suggest_agent_role([], ["SPEAKER_00", "SPEAKER_01"])["status"],
            "needs_confirmation",
        )

    def test_suggestion_requires_two_speakers_and_unique_evidence(self) -> None:
        evidence = [
            {"speaker_id": "SPEAKER_00", "start": 1.0, "text": "Em gọi từ công ty để tư vấn"},
            {"speaker_id": "SPEAKER_01", "start": 2.0, "text": "Tôi gọi bên trung tâm để hỗ trợ"},
        ]
        self.assertEqual(_suggest_agent_role(evidence, ["SPEAKER_00", "SPEAKER_01"])["status"], "needs_confirmation")
        self.assertEqual(_suggest_agent_role(evidence[:1], ["SPEAKER_00"])["status"], "needs_confirmation")


if __name__ == "__main__":
    unittest.main()
