import sys
import webbrowser
import threading
import time
import uvicorn

# Thiết lập encoding cho stdout/stderr tránh lỗi console Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def open_browser():
    time.sleep(2.0)
    try:
        webbrowser.open("http://127.0.0.1:8001/docs")
    except Exception:
        pass

if __name__ == "__main__":
    print("=" * 60)
    print("Server FastApi dang khoi dong...")
    print("Trang chu API: http://127.0.0.1:8001")
    print("Swagger UI: http://127.0.0.1:8001/docs")
    print("ReDoc: http://127.0.0.1:8001/redoc")
    print("=" * 60)
    
    threading.Thread(target=open_browser, daemon=True).start()
    
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)
