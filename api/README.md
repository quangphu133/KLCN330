# BuzzASR API

Dịch vụ này chạy độc lập trên máy có GPU và mặc định lắng nghe ở cổng `8000`.

```powershell
cd api
python -m pip install -r requirements.txt
$env:ASR_API_KEY = "your-shared-secret"
$env:ASR_HOST = "0.0.0.0"
python run.py
```

Backend nghiệp vụ gọi các endpoint `/jobs`, `/jobs/{job_id}` và
`/jobs/{job_id}/result` bằng Bearer token. Xem thêm
`buzzasr_bundle/README_API.md`.
