"""
Production seed — same as seed.py but with idempotent check:
only seeds if the DB is empty.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database import SessionLocal, engine
from app.models import Base, Floor

Base.metadata.create_all(bind=engine)

def seed_if_empty():
    db = SessionLocal()
    try:
        count = db.query(Floor).count()
        if count > 0:
            print(f"DB already seeded ({count} floors). Skipping.")
            return
        print("DB empty — seeding...")
        from app.services.seed import seed
        seed()
    finally:
        db.close()

if __name__ == "__main__":
    seed_if_empty()
