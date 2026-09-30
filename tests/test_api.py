import sys
import os
import io
from pathlib import Path

# Thêm root dir vào sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import time
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def get_admin_headers():
    """Đăng nhập với tài khoản admin và lấy Bearer Authorization headers."""
    res = client.post("/api/v1/auth/login", json={
        "username": "pham_thi_d",
        "password": "password123"
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_check():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"


def test_auth_login():
    res = client.post("/api/v1/auth/login", json={
        "username": "pham_thi_d",
        "password": "password123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

    # Kiểm tra GET /auth/me
    token = data["access_token"]
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["username"] == "pham_thi_d"


def test_user_crud():
    headers = get_admin_headers()
    username = f"telesale_{int(time.time())}"
    
    # 1. Create (Chỉ Admin)
    user_payload = {
        "username": username,
        "password": "password123",
        "full_name": "Nguyen Van B",
        "role": "telesales"
    }
    res_create = client.post("/api/v1/users/", json=user_payload, headers=headers)
    assert res_create.status_code == 201
    user_id = res_create.json()["id"]

    # 2. Get by ID
    res_get = client.get(f"/api/v1/users/{user_id}", headers=headers)
    assert res_get.status_code == 200
    assert res_get.json()["username"] == username

    # 3. Update
    res_update = client.put(f"/api/v1/users/{user_id}", json={"full_name": "Nguyen Van B - VIP"}, headers=headers)
    assert res_update.status_code == 200
    assert res_update.json()["full_name"] == "Nguyen Van B - VIP"

    # 4. List
    res_list = client.get("/api/v1/users/", headers=headers)
    assert res_list.status_code == 200
    assert any(u["id"] == user_id for u in res_list.json())

    # 5. Delete
    res_delete = client.delete(f"/api/v1/users/{user_id}", headers=headers)
    assert res_delete.status_code == 200


def test_audio_file_upload_and_analysis_flow():
    headers = get_admin_headers()

    # 1. Upload audio
    dummy_audio = b"RIFF....WAVEfmt ....data...."
    files = {"file": ("demo_call.wav", dummy_audio, "audio/wav")}
    res_file = client.post("/api/v1/files/upload", files=files, headers=headers)
    assert res_file.status_code == 201
    file_path = res_file.json()["file_path"]

    # 2. Process AI JSON Result & Call creation
    ai_call_payload = {
        "file_path": file_path,
        "ai_result": {
            "transcript": "Dạ em chào quý khách, em gọi tư vấn gói bảo hiểm. Mày không mua thì lượn đi.",
            "segments": [
                {"speaker": "agent", "start_time": 0.0, "end_time": 3.2, "text": "Dạ em chào quý khách, em gọi tư vấn gói bảo hiểm."},
                {"speaker": "customer", "start_time": 3.5, "end_time": 5.0, "text": "Tôi bận lắm."},
                {"speaker": "agent", "start_time": 5.2, "end_time": 7.8, "text": "Mày không mua thì lượn đi."}
            ],
            "sentiment": "negative",
            "duration": 8
        }
    }
    res_call = client.post("/api/v1/calls/", json=ai_call_payload, headers=headers)
    assert res_call.status_code == 201
    call_json = res_call.json()
    call_id = call_json["id"]
    
    assert call_json["compliance_score"] < 100.0
    assert len(call_json["violations"]) > 0
    
    # 3. Query violations
    res_viol = client.get(f"/api/v1/violations/?call_record_id={call_id}", headers=headers)
    assert res_viol.status_code == 200
    assert len(res_viol.json()) > 0

    # 4. Cleanup
    client.delete(f"/api/v1/calls/{call_id}", headers=headers)


if __name__ == "__main__":
    test_health_check()
    print("[PASS] Health Check Test")
    test_auth_login()
    print("[PASS] Auth & Login Test")
    test_user_crud()
    print("[PASS] User CRUD Test (Admin RBAC)")
    test_audio_file_upload_and_analysis_flow()
    print("[PASS] File Upload & AI Call Analysis Test")
    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")
