# BuzzASR API

Thư mục này chỉ chứa mã API tích hợp backend với [BuzzASR](https://github.com/lemn-lab/buzz-asr), mô hình AI có sẵn mà nhóm sử dụng. **Không có model/trọng số BuzzASR trong thư mục `api/`.** Người dùng tự tải model theo hướng dẫn của BuzzASR, chuẩn bị định dạng CTranslate2 phù hợp và đặt `BUZZASR_MODEL_DIR` tới đường dẫn tuyệt đối của thư mục model đã chuẩn bị. Cài các thư viện dưới đây không tự tải model.

Database PostgreSQL nghiệp vụ được cấu hình và truy cập qua `backend/`, không đi kèm thư mục này. Người dùng tự cài PostgreSQL và khởi tạo database theo [README chính](../README.md). Kho SQLite lưu job do API tạo lúc chạy không thay thế database nghiệp vụ.

Dịch vụ này chạy độc lập trên máy có GPU và mặc định lắng nghe ở cổng `8000`.

Bạn tự đặt tên và vị trí thư mục AI/model trên máy của mình. `api/` là tên thư mục mã nguồn trong repo này; model có thể nằm ở một thư mục riêng với tên bất kỳ, được khai báo bằng `BUZZASR_MODEL_DIR`.

```powershell
cd api
python -m pip install -r requirements.txt
$env:ASR_API_KEY = "your-shared-secret"
$env:ASR_HOST = "0.0.0.0"
$env:BUZZASR_MODEL_DIR = Read-Host 'Enter the absolute path to your CTranslate2 model folder'
python run.py
```

Backend nghiệp vụ gọi các endpoint `/jobs`, `/jobs/{job_id}` và
`/jobs/{job_id}/result` bằng Bearer token. Xem thêm
`buzzasr_bundle/README_API.md`.
