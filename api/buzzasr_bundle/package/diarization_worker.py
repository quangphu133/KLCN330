"""Local subprocess entry point for the dedicated diarization environment."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

_dll_directory_handles = []
_ffmpeg_bin = os.environ.get("ASR_FFMPEG_BIN")
if _ffmpeg_bin and Path(_ffmpeg_bin).is_dir() and hasattr(os, "add_dll_directory"):
    _dll_directory_handles.append(os.add_dll_directory(_ffmpeg_bin))

from diarization import diarize_audio


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    request = json.load(sys.stdin)
    result = diarize_audio(**request)
    json.dump(result, sys.stdout, ensure_ascii=False, allow_nan=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
