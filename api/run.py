<<<<<<< HEAD
from buzzasr_bundle.package.api_server import main


if __name__ == "__main__":
    main()
=======
import webbrowser
import threading
import time
import uvicorn

def open_browser():
    time.sleep(1.5)
    webbrowser.open("http://127.0.0.1:8000/docs")

if __name__ == "__main__":
    print("=" * 60)
    print(" Server đang khởi động...")
    print(" Trang chủ API: http://127.0.0.1:8000")
    print(" Giao diện Web tương tác (Swagger UI): http://127.0.0.1:8000/docs")
    print(" Tài liệu ReDoc: http://127.0.0.1:8000/redoc")
    print("=" * 60)
    
    # Tự động mở trình duyệt vào giao diện Swagger UI
    threading.Thread(target=open_browser, daemon=True).start()
    
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
>>>>>>> 9cbf175 (Them phan quyen)
