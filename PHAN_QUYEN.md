# 🔐 Hướng dẫn Phân quyền Admin / Nhân viên

Hệ thống sử dụng **JWT (JSON Web Token)** kết hợp **Bcrypt** để xác thực và phân quyền người dùng theo mô hình **RBAC (Role-Based Access Control)**.

---

## 📋 Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Các vai trò trong hệ thống](#2-các-vai-trò-trong-hệ-thống)
3. [Bảng phân quyền chi tiết](#3-bảng-phân-quyền-chi-tiết)
4. [Hướng dẫn đăng nhập](#4-hướng-dẫn-đăng-nhập)
5. [Cách gắn token vào request](#5-cách-gắn-token-vào-request)
6. [Tài khoản có sẵn để thử nghiệm](#6-tài-khoản-có-sẵn-để-thử-nghiệm)
7. [Các file liên quan trong dự án](#7-các-file-liên-quan-trong-dự-án)
8. [Luồng xử lý xác thực](#8-luồng-xử-lý-xác-thực)
9. [Migrate mật khẩu cũ lên Bcrypt](#9-migrate-mật-khẩu-cũ-lên-bcrypt)
10. [Các lỗi phổ biến](#10-các-lỗi-phổ-biến)

---

## 1. Tổng quan kiến trúc

```
Client ──── POST /auth/login ─────► Backend xác thực mật khẩu Bcrypt
                                           │
                                           ▼
                                    Tạo JWT Token (HS256)
                                    chứa: user_id, role, username
                                           │
Client ◄──── access_token ─────────────────┘

Client ──── Authorization: Bearer <token> ──► Mọi endpoint cần quyền
                                                      │
                                              Giải mã & kiểm tra JWT
                                              Xác định role → cho phép / từ chối
```

**Các thư viện sử dụng:**
| Thư viện | Mục đích |
|----------|----------|
| `bcrypt` | Băm mật khẩu one-way, chống brute-force |
| `python-jose` | Tạo & giải mã JWT token |

---

## 2. Các vai trò trong hệ thống

| Role | Giá trị trong DB | Mô tả |
|------|-----------------|-------|
| **Admin** | `admin` | Quản trị viên – toàn quyền hệ thống |
| **Nhân viên** | `telesales` | Nhân viên Telesales – chỉ thao tác với dữ liệu của mình |

> **Quy tắc:** Admin luôn có thể làm mọi thứ mà Nhân viên làm được, nhưng không ngược lại.

---

## 3. Bảng phân quyền chi tiết

### 🔑 Auth

| Endpoint | Method | Admin | Nhân viên | Mô tả |
|----------|--------|:-----:|:---------:|-------|
| `/api/v1/auth/login` | POST | ✅ | ✅ | Đăng nhập lấy JWT token |
| `/api/v1/auth/me` | GET | ✅ | ✅ | Xem thông tin tài khoản đang đăng nhập |

### 👤 Users (Quản lý người dùng)

| Endpoint | Method | Admin | Nhân viên | Mô tả |
|----------|--------|:-----:|:---------:|-------|
| `/api/v1/users/` | POST | ✅ | ❌ | Tạo tài khoản mới |
| `/api/v1/users/` | GET | ✅ | ❌ | Xem danh sách toàn bộ người dùng |
| `/api/v1/users/{id}` | GET | ✅ | ❌ | Xem chi tiết một người dùng bất kỳ |
| `/api/v1/users/{id}` | PUT | ✅ | ❌ | Cập nhật thông tin, role, trạng thái |
| `/api/v1/users/{id}` | DELETE | ✅ | ❌ | Xóa tài khoản (không thể tự xóa mình) |

> 💡 Nhân viên muốn xem thông tin bản thân dùng `GET /api/v1/auth/me`

### 📞 Calls (Bản ghi cuộc gọi)

| Endpoint | Method | Admin | Nhân viên | Mô tả |
|----------|--------|:-----:|:---------:|-------|
| `/api/v1/calls/` | POST | ✅ Mọi nhân viên | ✅ Chỉ gắn ID bản thân | Tạo bản ghi cuộc gọi mới |
| `/api/v1/calls/` | GET | ✅ Xem tất cả | ✅ Chỉ xem của mình | Danh sách cuộc gọi |
| `/api/v1/calls/{id}` | GET | ✅ Bất kỳ | ✅ Chỉ cuộc gọi của mình | Chi tiết cuộc gọi |
| `/api/v1/calls/{id}` | DELETE | ✅ | ❌ | Xóa bản ghi cuộc gọi |

### ⚠️ Violations (Vi phạm)

| Endpoint | Method | Admin | Nhân viên | Mô tả |
|----------|--------|:-----:|:---------:|-------|
| `/api/v1/violations/` | GET | ✅ Xem tất cả | ✅ Chỉ xem vi phạm của cuộc gọi mình | Danh sách vi phạm |

### 📁 Files (File âm thanh)

| Endpoint | Method | Admin | Nhân viên | Mô tả |
|----------|--------|:-----:|:---------:|-------|
| `/api/v1/files/upload` | POST | ✅ | ✅ | Upload file âm thanh |
| `/api/v1/files/download/{name}` | GET | ✅ | ✅ | Tải xuống file |

### 🎙️ Transcribe (Phiên âm ASR)

| Endpoint | Method | Admin | Nhân viên | Mô tả |
|----------|--------|:-----:|:---------:|-------|
| `/api/v1/transcribe/upload` | POST | ✅ Chỉ định ID bất kỳ | ✅ Tự động gắn ID bản thân | Upload & phiên âm audio |
| `/api/v1/transcribe/{job_id}/status` | GET | ✅ | ✅ | Xem trạng thái job |
| `/api/v1/transcribe/{job_id}/poll` | POST | ✅ | ✅ | Kích hoạt lại polling |

---

## 4. Hướng dẫn đăng nhập

### Cách 1: Swagger UI (Khuyên dùng khi phát triển)

1. Mở trình duyệt → truy cập **http://localhost:8000/docs**
2. Tìm nhóm **Auth** → click **`POST /api/v1/auth/login`**
3. Click **"Try it out"** → nhập thông tin:

```json
{
  "username": "pham_thi_d",
  "password": "password123"
}
```

4. Click **"Execute"** → kết quả trả về:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {
    "id": 4,
    "username": "pham_thi_d",
    "full_name": "Pham Thi D",
    "role": "admin",
    "is_active": true
  }
}
```

5. **Copy `access_token`** → click nút **"Authorize 🔒"** ở góc trên phải Swagger
6. Dán token vào ô **Value**: `Bearer <dán_token_vào_đây>` → click **Authorize**

> Sau bước này, Swagger tự động gắn token vào mọi request tiếp theo!

---

### Cách 2: cURL (Command line)

```bash
# Bước 1: Đăng nhập
curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"username\": \"pham_thi_d\", \"password\": \"password123\"}"

# Bước 2: Dùng token (thay <TOKEN> bằng access_token nhận được)
curl -X GET "http://localhost:8000/api/v1/auth/me" \
     -H "Authorization: Bearer <TOKEN>"

# Bước 3: Ví dụ gọi API có quyền Admin
curl -X GET "http://localhost:8000/api/v1/users/" \
     -H "Authorization: Bearer <TOKEN>"
```

---

### Cách 3: Postman

1. Tạo request `POST` đến `http://localhost:8000/api/v1/auth/login`
2. Tab **Body** → chọn **raw** → **JSON** → nhập:
   ```json
   { "username": "pham_thi_d", "password": "password123" }
   ```
3. Gửi request → copy `access_token` trong response
4. Ở các request tiếp theo → tab **Authorization** → Type: **Bearer Token** → dán token vào

---

## 5. Cách gắn token vào request

Mọi endpoint (trừ `/auth/login`, `/health`, `/`) đều yêu cầu token trong **HTTP Header**:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token có hiệu lực trong 8 giờ** (480 phút). Sau khi hết hạn cần đăng nhập lại.

---

## 6. Tài khoản có sẵn để thử nghiệm

| Username | Password | Role | Ghi chú |
|----------|----------|------|---------|
| `pham_thi_d` | `password123` | **admin** | Quản trị viên toàn quyền |
| `nguyen_van_a` | `password123` | `telesales` | Nhân viên thông thường |
| `tran_thi_b` | `password123` | `telesales` | Nhân viên thông thường |
| `le_van_c` | `password123` | `telesales` | Nhân viên thông thường |
| `hoang_van_e` | `password123` | `telesales` | Nhân viên thông thường |

---

## 7. Các file liên quan trong dự án

```
app/
├── core/
│   ├── security.py        ← Hash bcrypt + tạo/giải mã JWT
│   └── dependencies.py    ← get_current_user, require_admin, require_nhanvien
├── schemas/
│   └── auth_schema.py     ← Schema LoginRequest, TokenResponse
├── api/v1/endpoints/
│   ├── auth.py            ← POST /auth/login | GET /auth/me
│   ├── users.py           ← CRUD người dùng (Admin only)
│   ├── calls.py           ← Bản ghi cuộc gọi (phân quyền xem)
│   ├── violations.py      ← Vi phạm (phân quyền xem)
│   ├── files.py           ← Upload/download file (yêu cầu đăng nhập)
│   └── transcribe.py      ← Phiên âm ASR (yêu cầu đăng nhập)
migrate_passwords.py       ← Script chuyển mật khẩu cũ sang Bcrypt
```

### Chi tiết các Dependency (app/core/dependencies.py)

| Dependency | Áp dụng khi |
|-----------|-------------|
| `get_current_user` | Yêu cầu đăng nhập, bất kỳ role nào |
| `require_admin` | Chỉ cho phép role = `admin` |
| `require_nhanvien` | Cho phép cả `admin` lẫn `telesales` |

---

## 8. Luồng xử lý xác thực

```
1. Client gửi POST /auth/login {"username", "password"}
        │
2. Backend truy vấn DB lấy user theo username
        │
3. Kiểm tra password bằng bcrypt.checkpw()
        │ (sai → 401 Unauthorized)
        │ (đúng nhưng is_active=False → 403 Forbidden)
        │ (đúng và active ✓)
        ▼
4. Tạo JWT token:
   {
     "sub": "4",           ← user_id
     "role": "admin",
     "username": "pham_thi_d",
     "exp": <timestamp hết hạn>
   }
   Ký bằng SECRET_KEY (HS256)
        │
5. Trả về access_token cho Client
        │
──── Mọi request tiếp theo ────
        │
6. Client gửi Header: Authorization: Bearer <token>
        │
7. FastAPI Dependency (get_current_user) giải mã JWT:
   - Nếu token hết hạn / sai chữ ký → 401
   - Lấy user_id từ "sub" → truy vấn DB
   - Nếu user không tồn tại / is_active=False → 401/403
        │
8. Dependency (require_admin / require_nhanvien) kiểm tra role
   - Không đủ quyền → 403 Forbidden
   - Đủ quyền → Xử lý request bình thường ✅
```

---

## 9. Migrate mật khẩu cũ lên Bcrypt

Nếu có tài khoản cũ được tạo với mật khẩu dạng **plain-text** hoặc **SHA-256**, chạy script sau để băm lại toàn bộ sang chuẩn Bcrypt:

```bash
python migrate_passwords.py
```

**Kết quả mẫu:**
```
[INFO] Bắt đầu kiểm tra 6 tài khoản trong database...

 -> [ĐÃ CẬP NHẬT] User: 'nguyen_van_a' (ID: 1) | Role: telesales  | Mật khẩu: 'password123'
 -> [ĐÃ CẬP NHẬT] User: 'pham_thi_d'   (ID: 4) | Role: admin      | Mật khẩu: 'password123'
...

[THÀNH CÔNG] Đã băm lại mật khẩu chuẩn Bcrypt cho 6 người dùng.
[TỔNG KẾT] Đã xử lý: 6 cập nhật mới, 0 đã băm trước đó.
```

> ⚠️ **Chỉ cần chạy một lần duy nhất.** Lần chạy tiếp theo script sẽ tự nhận diện và bỏ qua các tài khoản đã được băm.

---

## 10. Các lỗi phổ biến

| Mã lỗi | Nguyên nhân | Cách khắc phục |
|--------|------------|----------------|
| `401 Unauthorized` | Chưa gửi token hoặc token sai / hết hạn | Đăng nhập lại để lấy token mới |
| `403 Forbidden` | Token hợp lệ nhưng không đủ quyền | Dùng tài khoản có role phù hợp |
| `401` – "Tên đăng nhập hoặc mật khẩu không đúng" | Sai username/password | Kiểm tra lại thông tin đăng nhập |
| `403` – "Tài khoản đã bị vô hiệu hóa" | `is_active = false` trong DB | Admin kích hoạt lại tài khoản |
| `403` – "Chỉ Quản trị viên mới có quyền..." | Nhân viên gọi API của Admin | Dùng tài khoản Admin |
