import sys
import os
from pathlib import Path
import time

from fastapi.testclient import TestClient

# Add the project root directory to sys.path.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app


client = TestClient(app)


def test_health_check():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"


def test_user_crud():
    username = f"telesale_{int(time.time())}"

    # 1. Create
    user_payload = {
        "username": username,
        "password": "password123",
        "full_name": "Nguyen Van B",
        "role": "telesales",
    }

    res_create = client.post("/api/v1/users/", json=user_payload)
    assert res_create.status_code == 201
    user_id = res_create.json()["id"]

    # 2. Get by ID
    res_get = client.get(f"/api/v1/users/{user_id}")
    assert res_get.status_code == 200
    assert res_get.json()["username"] == username

    # 3. Update
    res_update = client.put(
        f"/api/v1/users/{user_id}",
        json={"full_name": "Nguyen Van B - VIP"},
    )
    assert res_update.status_code == 200
    assert res_update.json()["full_name"] == "Nguyen Van B - VIP"

    # 4. List
    res_list = client.get("/api/v1/users/")
    assert res_list.status_code == 200
    assert any(user["id"] == user_id for user in res_list.json())

    # 5. Delete
    res_delete = client.delete(f"/api/v1/users/{user_id}")
    assert res_delete.status_code == 200


def test_audio_file_upload_and_analysis_flow():
    # 1. Upload audio
    dummy_audio = b"RIFF....WAVEfmt ....data...."
    files = {
        "file": (
            "demo_call.wav",
            dummy_audio,
            "audio/wav",
        )
    }

    res_file = client.post("/api/v1/files/upload", files=files)
    assert res_file.status_code == 201
    file_path = res_file.json()["file_path"]

    # 2. Process AI JSON result and create a call record.
    ai_call_payload = {
        "file_path": file_path,
        "ai_result": {
            "transcript": (
                "Dạ em chào quý khách, em gọi tư vấn gói bảo hiểm. "
                "Mày không mua thì lượn đi."
            ),
            "segments": [
                {
                    "speaker": "agent",
                    "start_time": 0.0,
                    "end_time": 3.2,
                    "text": (
                        "Dạ em chào quý khách, "
                        "em gọi tư vấn gói bảo hiểm."
                    ),
                },
                {
                    "speaker": "customer",
                    "start_time": 3.5,
                    "end_time": 5.0,
                    "text": "Tôi bận lắm.",
                },
                {
                    "speaker": "agent",
                    "start_time": 5.2,
                    "end_time": 7.8,
                    "text": "Mày không mua thì lượn đi.",
                },
            ],
"sentiment": "negative",
            "duration": 8,
        },
    }

    res_call = client.post("/api/v1/calls/", json=ai_call_payload)
    assert res_call.status_code == 201

    call_json = res_call.json()
    call_id = call_json["id"]

    assert call_json["compliance_score"] < 100.0
    assert len(call_json["violations"]) > 0

    # 3. Query violations
    res_violations = client.get(
        f"/api/v1/violations/?call_record_id={call_id}"
    )
    assert res_violations.status_code == 200
    assert len(res_violations.json()) > 0

    # 4. Cleanup
    res_delete = client.delete(f"/api/v1/calls/{call_id}")
    assert res_delete.status_code == 200


if __name__ == "__main__":
    test_health_check()
    print("[PASS] Health Check Test")

    test_user_crud()
    print("[PASS] User CRUD Test")

    test_audio_file_upload_and_analysis_flow()
    print("[PASS] File Upload and AI Call Analysis Test")

    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")