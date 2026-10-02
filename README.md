# Hệ thống hậu kiểm và đánh giá cuộc gọi

Mã nguồn web và backend phục vụ khóa luận: tải bản ghi cuộc gọi, phiên âm tiếng Việt, phân tách người nói, xác nhận vai trò nhân viên/khách hàng và đánh giá tuân thủ theo quy tắc hiện có.

- **Web và backend:** [quangphu133/KLTN330_FE_BE](https://github.com/quangphu133/KLTN330_FE_BE).
- **Android App dành cho nhân viên:** [quangphu133/KNTN330_DT](https://github.com/quangphu133/KNTN330_DT). Đây là repository riêng, không nằm trong thư mục `frontend/`.
- **Nguồn AI:** [BuzzASR — lemn-lab/buzz-asr](https://github.com/lemn-lab/buzz-asr). Nhóm sử dụng mô hình có sẵn từ BuzzASR để tích hợp vào hệ thống. Người dùng tự tải model và thiết lập môi trường theo hướng dẫn của BuzzASR trước khi sử dụng.

## 1. Cấu trúc và luồng kết nối

| Thành phần | Thư mục | Vai trò | Cổng local |
| --- | --- | --- | --- |
| Web Next.js | `frontend/` | Quản lý và xem kết quả cuộc gọi | `3000` |
| Backend FastAPI | `backend/` | Tài khoản, dữ liệu nghiệp vụ, lưu audio, điều phối AI | `8001` |
| API tích hợp BuzzASR | `api/` | Nhận yêu cầu từ backend và gọi model BuzzASR đã được tải, cấu hình riêng; không chứa model | `8000` |
| PostgreSQL | Dịch vụ cài riêng | Lưu dữ liệu nghiệp vụ | `5432` mặc định |

```text
Web / App -> Backend :8001 -> BuzzASR API :8000
                  |
             PostgreSQL
```

**Repository chỉ cung cấp mã nguồn tích hợp.** Thư mục `api/` chứa mã API kết nối backend với BuzzASR, không chứa model/trọng số BuzzASR. Mọi người cần tự tải model từ nguồn BuzzASR và cấu hình đường dẫn để API sử dụng. Clone repo hoặc cài thư viện Python không đồng nghĩa đã có model.

**Database cũng cần tự chuẩn bị:** repo có model dữ liệu ORM và migration SQL trong `backend/`, không kèm bản sao lưu dữ liệu, tài khoản đăng nhập hay dữ liệu cuộc gọi thực tế. Người dùng tự cài PostgreSQL, tạo database và khởi tạo bảng theo phần 3. Việc kết nối database nghiệp vụ do `backend/` thực hiện.

## 2. Chuẩn bị và lấy mã nguồn

Hướng dẫn dùng Windows và **PowerShell**. Cần Git, Python 3.12, Node.js 20 trở lên với npm, PostgreSQL đang hoạt động và công cụ `psql`/`pg_dump` nếu thao tác database trong terminal. Có thể dùng pgAdmin cho các thao tác SQL tương ứng.

Máy chỉ chạy web/backend. Máy AI cần model BuzzASR được tải riêng, ở định dạng CTranslate2 mà mã API hiện tại sử dụng, cùng môi trường GPU tương thích.

```powershell
git clone https://github.com/quangphu133/KLTN330_FE_BE.git
cd KLTN330_FE_BE
py -3.12 -m venv .venv-doan
.\.venv-doan\Scripts\python.exe -m pip install -r .\backend\requirements.lock.txt
```

Dùng trực tiếp Python của môi trường ảo nên không bắt buộc chạy `Activate.ps1`. `requirements.lock.txt` ghi các phiên bản backend đã chốt; `requirements.txt` khai báo phụ thuộc trực tiếp. Cài thư viện AI vào môi trường riêng.

## 3. Cấu hình backend và PostgreSQL

Từ thư mục gốc repo, sao chép mẫu nếu chưa có cấu hình local:

```powershell
if (-not (Test-Path .\backend\.env)) {
    Copy-Item .\backend\.env.example .\backend\.env
}
```

Mở `backend/.env`, thay các giá trị giữ chỗ bằng cấu hình của máy:

```dotenv
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_DB_PASSWORD@127.0.0.1:5432/do_an_db
APP_ENV=development
SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ASR_BASE_URL=http://127.0.0.1:8000
ASR_API_KEY=REPLACE_WITH_THE_SAME_KEY_AS_THE_AI_SERVER
```

- Tạo database PostgreSQL trước; `init_db` tạo bảng, không tạo database PostgreSQL.
- Mật khẩu có ký tự đặc biệt trong `DATABASE_URL` cần được mã hóa URL.
- `SECRET_KEY` ký JWT đăng nhập. `ASR_API_KEY` xác thực backend với AI và phải giống nhau ở hai phía.
- Nếu AI chạy trên máy khác, đổi `ASR_BASE_URL` sang địa chỉ LAN/Tailscale thực tế của máy AI.

### Database mới

Ví dụ tạo database bằng `psql` (bỏ qua nếu đã tạo bằng pgAdmin), sau đó khởi tạo bảng:

```powershell
psql -h 127.0.0.1 -U postgres -d postgres -c 'CREATE DATABASE do_an_db;'
cd backend
..\.venv-doan\Scripts\python.exe -m app.db.init_db
```

Lệnh khởi tạo tạo bảng còn thiếu và thêm các mục từ điển Regex mặc định. Nó không tự tạo tài khoản đăng nhập và không tự nâng cấp cột trong bảng cũ.

### Database đã có dữ liệu

Sao lưu trước khi thay đổi schema. Các lệnh dưới chạy từ `KLTN330_FE_BE/backend`; điều chỉnh host, user và database theo máy:

```powershell
$backupFile = "backup-before-migration-$(Get-Date -Format 'yyyyMMdd-HHmmss').dump"
pg_dump -Fc -h 127.0.0.1 -U postgres -d do_an_db -f $backupFile
```

Chỉ tiếp tục khi sao lưu thành công; giữ bản sao ngoài repository.

- `migrations/001_merge_backends.sql`: dành cho database của backend cũ ở thư mục gốc, có các bảng `users`, `call_records`, `asr_jobs` cần bổ sung cột tương thích.
- `migrations/002_add_call_analysis_data.sql`: bổ sung cột lưu phiên âm, diarization và vai trò người nói cho bảng `call_records` cũ.
- `migrations/003_add_call_notifications.sql`: tạo bảng và chỉ mục thông báo cuộc gọi cho web/app.
- `migrations/004_remove_operators.sql`: bỏ danh mục Operator cũ, dùng tài khoản `users` với `role = 'telesales'` và liên kết `telesale_id`. Dừng upload, chờ các job kết thúc và kiểm tra dữ liệu trước khi chạy; migration tự dừng nếu còn Operator hoặc tham chiếu `operator_id`, không tự đoán tài khoản thay thế.

Chọn migration phù hợp với schema hiện tại; không chạy `001` trên database rỗng:

```powershell
psql -h 127.0.0.1 -U postgres -d do_an_db -v ON_ERROR_STOP=1 -f .\migrations\001_merge_backends.sql
psql -h 127.0.0.1 -U postgres -d do_an_db -v ON_ERROR_STOP=1 -f .\migrations\002_add_call_analysis_data.sql
psql -h 127.0.0.1 -U postgres -d do_an_db -v ON_ERROR_STOP=1 -f .\migrations\003_add_call_notifications.sql
psql -h 127.0.0.1 -U postgres -d do_an_db -v ON_ERROR_STOP=1 -f .\migrations\004_remove_operators.sql
..\.venv-doan\Scripts\python.exe -m app.db.init_db
```

Migration `001` và `002` chưa có script rollback đi kèm. Khi cần hoàn tác, phục hồi bản sao lưu vào database riêng, kiểm tra dữ liệu rồi mới đổi `DATABASE_URL`. Migration `004` có script rollback chỉ tạo lại cấu trúc Operator rỗng. Với thông báo, file `003_add_call_notifications_rollback.sql` chỉ hướng dẫn hoàn tác code và giữ nguyên bảng/lịch sử thông báo. Xem thêm [hướng dẫn backend](backend/README.md).

## 4. Chạy backend và tạo tài khoản local

Mở terminal ở `KLTN330_FE_BE/backend`:

```powershell
..\.venv-doan\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

- Health: <http://127.0.0.1:8001/health>.
- Swagger: <http://127.0.0.1:8001/docs>.
- Có thể dùng `..\.venv-doan\Scripts\python.exe run.py` để chạy chế độ phát triển có reload và tự mở Swagger.

API `POST /api/users/` yêu cầu tài khoản admin đã đăng nhập. Với database mới chưa có admin, mở terminal khác tại `KLTN330_FE_BE/backend` và tạo admin đầu tiên bằng cấu hình database local:

```powershell
..\.venv-doan\Scripts\python.exe -X utf8 -c @'
from getpass import getpass
from app.db.database import SessionLocal
from app.models.user import User
from app.schemas.user_schema import UserCreate
from app.services.user_service import UserService

with SessionLocal() as db:
    if db.query(User).filter(User.role == "admin").first():
        raise SystemExit("An admin account already exists. Sign in to manage accounts.")
    account = UserCreate(
        email=input("Admin email: ").strip(),
        full_name=input("Full name: ").strip(),
        password=getpass("Password (at least 6 characters): "),
        role="admin",
    )
    user = UserService.create(db, account)
    print(f"Created admin account: {user.email}")
'@
```

Sau đó đăng nhập qua web hoặc `POST /api/auth/signin`. Admin tạo nhân viên tại trang **Nhân viên tổng đài**, hoặc gọi `POST /api/users/` kèm Bearer token. Repo không kèm tài khoản/mật khẩu dùng chung. Nhân viên truy cập cuộc gọi và job thuộc tài khoản của mình; các API quản lý yêu cầu quyền admin. Khi triển khai ngoài môi trường local, cấu hình HTTPS và kiểm thử quyền truy cập với tài khoản thực tế.

## 5. Chạy giao diện web

Mở terminal khác từ thư mục gốc repo:

```powershell
cd frontend
npm ci
```

Tạo `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_BASE_API_URL=http://127.0.0.1:8001/
```

**Giữ dấu `/` cuối URL và không thêm `/api`.** Một số lời gọi web nối trực tiếp URL gốc với `api/...`, gồm endpoint phát audio. Khởi động lại Next.js sau khi đổi file môi trường.

```powershell
npm run dev
```

Mở <http://localhost:3000/auth/sign-in> và đăng nhập bằng tài khoản đã tạo. Chế độ demo của web có dữ liệu mô phỏng; kiểm thử backend/AI cần dùng tài khoản thật trong database.

## 6. Tự tải BuzzASR và kết nối qua API

AI phiên âm mà nhóm sử dụng được lấy từ [BuzzASR](https://github.com/lemn-lab/buzz-asr). Mỗi người tự tải model theo tài liệu của dự án nguồn và chuẩn bị model tương thích với định dạng CTranslate2 mà API này yêu cầu. Repository này không phân phối model BuzzASR và không tự tải model khi khởi động.

Thư mục `api/` chỉ cung cấp mã dịch vụ API tích hợp với model đã chuẩn bị: nhận audio, gọi xử lý và trả trạng thái/kết quả cho backend. Các lệnh dưới đây cài và chạy lớp API này, không phải lệnh tải model BuzzASR. Phân tách người nói sử dụng pyannote và cần cấu hình riêng như bên dưới.

Bạn tự chọn vị trí và tên thư mục chứa mã API AI/model trên máy của mình; không yêu cầu tên thư mục hoặc ổ đĩa cố định. Nếu đã chạy dịch vụ AI từ thư mục riêng đó, cấu hình `ASR_BASE_URL` và cùng một `ASR_API_KEY` ở hai phía; không mở thêm bản `api/` trên cùng cổng `8000`.

Sau khi tự tải và chuẩn bị model, nếu dùng lớp API trong repo này, làm các bước sau **trên máy AI**, từ thư mục gốc repo:

```powershell
py -3.12 -m venv .venv-asr-local
.\.venv-asr-local\Scripts\python.exe -m pip install -r .\api\requirements.txt
py -3.12 -m venv .venv-diarization
.\.venv-diarization\Scripts\python.exe -m pip install -r .\api\buzzasr_bundle\package\requirements-diarization.txt
```

Cài phụ thuộc chưa đủ để chạy model trên mọi máy. Cần chuẩn bị:

- Model BuzzASR do người dùng tự tải và chuẩn bị ở định dạng CTranslate2. `BUZZASR_MODEL_DIR` phải là đường dẫn tuyệt đối đến thư mục model trên máy của người dùng; model không có sẵn trong `api/`.
- CUDA/cuDNN và driver tương thích với CTranslate2. Bộ phụ thuộc diarization khai báo PyTorch CUDA 12.8.
- Quyền truy cập model `pyannote/speaker-diarization-community-1` trên Hugging Face và token phù hợp.
- TorchCodec/FFmpeg hoạt động trong môi trường diarization. Trên Windows, khi cần nạp DLL FFmpeg, đặt `ASR_FFMPEG_BIN` tới thư mục `bin` của bản FFmpeg shared phù hợp.

`requirements-diarization.lock.txt` hiện chứa đường dẫn wheel TorchCodec local của máy phát triển. Dùng file `requirements-diarization.txt` như trên, không dùng nguyên lockfile đó trên máy khác.

Trong cùng terminal PowerShell 7, từ thư mục gốc repo:

```powershell
$env:ASR_API_KEY = Read-Host 'Enter the shared ASR API key' -MaskInput
$env:HF_TOKEN = Read-Host 'Enter the Hugging Face token' -MaskInput
$env:ASR_HOST = '127.0.0.1'
$env:ASR_PORT = '8000'
$env:BUZZASR_MODEL_DIR = Read-Host 'Enter the absolute path to your CTranslate2 model folder'
$env:ASR_DATA_DIR = Join-Path (Get-Location) 'api\asr_service_data'
$env:ASR_ENABLE_DIARIZATION = 'true'
$env:ASR_DIARIZATION_PYTHON = (Resolve-Path .\.venv-diarization\Scripts\python.exe).Path
.\.venv-asr-local\Scripts\python.exe .\api\run.py
```

Khi lệnh hỏi đường dẫn, nhập đường dẫn tuyệt đối tới thư mục model CTranslate2 bạn đã tự tải và chuẩn bị; tên thư mục và ổ đĩa do bạn tự đặt. `ASR_DATA_DIR` trong ví dụ được tạo theo vị trí repo hiện tại, cũng có thể đổi sang thư mục lưu audio/job riêng. Khóa ASR nhập ở đây phải khớp `backend/.env`. `HF_TOKEN` chỉ dùng phía AI, không đặt trong web/Flutter. Bản API trong repo này đọc biến môi trường: chỉ tạo `api/.env` không tự nạp cấu hình, và không nên giả định API sẽ hỏi token khi thiếu.

Mọi endpoint AI, kể cả health, cần header Bearer. Trong terminal PowerShell 7 khác:

```powershell
$asrKey = Read-Host 'Enter the shared ASR API key' -MaskInput
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health' -Headers @{ Authorization = "Bearer $asrKey" }
Remove-Variable asrKey
```

`ready=true` xác nhận model ASR sẵn sàng; vẫn cần chạy audio đến khi hoàn tất để kiểm tra diarization. Dừng dịch vụ bằng `Ctrl+C` trong terminal tương ứng; đóng terminal AI sau khi dùng để kết thúc phiên chứa token.

## 7. Kiểm thử một cuộc gọi

1. Khởi động PostgreSQL, AI, backend và web; kiểm tra health của hai API.
2. Đăng nhập tài khoản thật, tải audio qua `POST /api/transcribe/upload` (web hoặc Swagger). WAV, MP3, M4A, OGG, FLAC được cả backend và AI chấp nhận. Backend mặc định giới hạn 50 MB, AI mặc định giới hạn 30 phút.
3. Theo dõi `GET /api/transcribe/{job_id}/status` tới `completed` hoặc `failed`; đọc `error_message` nếu có.
4. Dùng `call_record_id` để đọc `GET /api/mediafile/{id}/result` và nghe `GET /api/mediafile/{id}/stream`.
5. Khi diarization hoàn tất với đúng hai speaker, xác nhận người tư vấn qua `PUT /api/mediafile/{id}/speaker-roles`, ví dụ JSON `{"agentSpeakerId":"SPEAKER_01"}`. Chọn theo nội dung/nghe thực tế, không mặc định speaker đầu tiên là nhân viên.
6. Đọc `roleMapping`, `keywordsSearchResult.regions` và `complianceScore` trong kết quả mediafile; `GET /api/calls/{id}` dùng tên trường `compliance_score`. Điểm chưa có là `null`, không phải 0. Điểm tuân thủ dựa trên Regex trong `backend/app/services/rule_service.py`, không phải điểm cảm xúc hoặc một checklist tùy ý trên giao diện.

Nếu AI ngoại tuyến, backend có thể lưu audio cùng job thất bại; HTTP 202 chỉ cho biết đã tiếp nhận, không chứng minh AI phân tích thành công. Audio một người nói có thể trả `unsupported_speaker_count`, không đủ điều kiện xác nhận hai vai trò.

## 8. Kết nối Android app

Hướng dẫn Flutter nằm tại [KNTN330_DT](https://github.com/quangphu133/KNTN330_DT). `API_BASE_URL` của app là địa chỉ gốc backend, không thêm `/api`:

| Thiết bị | `API_BASE_URL` |
| --- | --- |
| Android Emulator trên máy backend | `http://10.0.2.2:8001` |
| Điện thoại thật cùng LAN | `http://<IP_LAN_MAY_BACKEND>:8001` |

Với điện thoại thật, backend cần bind IP LAN hoặc `0.0.0.0`, firewall cho phép thiết bị thử nghiệm truy cập cổng `8001`. `localhost` trên điện thoại là chính điện thoại. HTTP chỉ phục vụ demo debug; bản release dùng HTTPS theo hướng dẫn repo app.

Backend hiện có `GET /api/analytics/me`, `GET /api/transcribe/`, `GET /api/notifications/` và `PATCH /api/notifications/{id}/read` cho app. Web và app dùng chung tài khoản nhân viên trong `users` và chủ sở hữu cuộc gọi qua `telesale_id`. Với database cũ, kiểm tra migration `003`/`004` trước khi chạy phiên bản này. Kiểm thử upload, xác nhận người nói, thông báo và nghe audio bằng cùng tài khoản/cùng ID cuộc gọi để xác nhận kết nối thực tế giữa hai repo.

## 9. Kiểm tra mã nguồn

Backend, từ thư mục gốc repo:

```powershell
cd backend
..\.venv-doan\Scripts\python.exe -m pytest
```

Bộ test cấu hình SQLite và thư mục upload tạm riêng.

Frontend, mở terminal khác từ thư mục gốc repo:

```powershell
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

Sau khi build thành công, dùng `npm run start` để chạy bản build.
