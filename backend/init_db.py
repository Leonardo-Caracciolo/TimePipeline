"""
Initializes the database schema without seeding any data.
Run this on first deploy to create tables only.
"""
from app.core.database import init_db

if __name__ == "__main__":
    init_db()
    print("✅ Database initialized (empty).")
