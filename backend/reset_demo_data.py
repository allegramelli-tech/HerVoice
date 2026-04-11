import os
import shutil
from database import engine, Base

DB_FILE = "hackathon.db"
UPLOAD_DIR = "uploads"


def reset_database():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print(f"[RESET] Removed database file: {DB_FILE}")
    else:
        print(f"[RESET] Database file not found, nothing to remove: {DB_FILE}")

    Base.metadata.create_all(bind=engine)
    print("[RESET] Recreated all database tables.")


def reset_uploads():
    if os.path.exists(UPLOAD_DIR):
        for filename in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        print(f"[RESET] Cleared uploads directory: {UPLOAD_DIR}")
    else:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        print(f"[RESET] Created uploads directory: {UPLOAD_DIR}")


if __name__ == "__main__":
    print("[RESET] Starting demo data reset...")
    reset_database()
    reset_uploads()
    print("[RESET] Demo data reset complete.")