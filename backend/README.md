# Business backend

FastAPI nghiệp vụ chạy ở cổng `8001`. Backend quản lý người dùng, operator,
project, checklist, từ điển, cuộc gọi, thống kê và điều phối job BuzzASR.

```powershell
cd backend
..\.venv-doan\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m app.db.init_db
python run.py
```

Use `requirements.lock.txt` instead of `requirements.txt` when reproducing the
dependency versions verified in this workspace.

Swagger UI: <http://127.0.0.1:8001/docs>

Nếu PostgreSQL đã từng được tạo bởi backend cũ trong thư mục gốc, chạy một lần
`migrations/001_merge_backends.sql` bằng pgAdmin hoặc `psql` trước khi khởi động.

Luồng upload chính là `POST /api/transcribe/upload`. Backend gửi audio tới
dịch vụ trong thư mục `../api`, theo dõi job rồi tạo bản ghi cuộc gọi.

If PostgreSQL was previously created by the backend in the repository root,
apply `migrations/001_merge_backends.sql` with pgAdmin or `psql` before the
initialization command above.

The backend connects to PostgreSQL through `psycopg2-binary`; keep the
`postgresql+psycopg2://` driver in `DATABASE_URL`. Start the ASR service on the
GPU computer, expose port 8000 only on the Tailscale interface, then set
`ASR_BASE_URL` in this backend's `.env` to `http://100.73.116.10:8000` and
configure the same `ASR_API_KEY` on both computers. Check `/health` on the
backend and the authenticated ASR health endpoint before uploading a call.

Diarization được lưu trong `call_records.analysis_data`. Sau khi cài model
trong môi trường ASR riêng, API trả gợi ý vai trò tại
`GET /api/mediafile/{id}/result`; xác nhận bằng
`PUT /api/mediafile/{id}/speaker-roles` với JSON
`{"agentSpeakerId":"SPEAKER_00"}`. Chạy migration
`migrations/002_add_call_analysis_data.sql` một lần trước khi xử lý cuộc gọi mới.
