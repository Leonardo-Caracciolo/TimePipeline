"""
Drops all tables and recreates them with the current schema.
Use only when the schema changed and the DB needs to be reset.
Run: python reset_db.py
"""
from app.core.database import engine, init_db
from app.core.database import Base

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Recreating schema...")
init_db()
print("✅ Database reset complete.")