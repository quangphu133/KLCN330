# Compliance Call Review

Workspace được chia thành ba ứng dụng độc lập:

- `frontend/`: Next.js, chạy cổng `3000`.
- `backend/`: FastAPI nghiệp vụ, chạy cổng `8001`.
- `api/`: BuzzASR GPU API, chạy cổng `8000`.

```text
Browser :3000 -> Backend :8001 -> BuzzASR API :8000
                           |
                       PostgreSQL
```

## Chạy frontend

```powershell
cd frontend
npm install
npm run dev
```

## Chạy backend

Tham khảo file `backend/.env.example` rồi tạo file `backend/.env`, đổi địa chỉ với mật khẩu PostgreSQL,
`ASR_BASE_URL` và `ASR_API_KEY`, sau đó:

```powershell
cd backend
python -m pip install -r requirements.txt
python run.py
```

## Chạy BuzzASR API

API mọi người tự làm nha. Project sử dụng BuzzASR.
