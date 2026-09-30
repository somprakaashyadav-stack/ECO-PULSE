from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Floor, Unit, ParkingBay
from app.schemas import UnitOut, ParkingBayOut, EVStatusResponse
from typing import List
import random

router = APIRouter(prefix="/api/floors", tags=["Floors"])


@router.get("/basement", response_model=EVStatusResponse)
def get_basement(db: Session = Depends(get_db)):
    bays = db.query(ParkingBay).order_by(ParkingBay.row_label, ParkingBay.col_number).all()
    ev_bays = [b for b in bays if b.is_ev]
    occupied = [b for b in bays if b.is_occupied]
    # Simulate solar generation (6am–6pm produces up to 48 kWh)
    import datetime
    hour = datetime.datetime.now().hour
    solar_factor = max(0, min(1, (hour - 6) / 6)) if hour < 12 else max(0, min(1, (18 - hour) / 6))
    solar_kwh = round(48 * solar_factor, 1)
    return EVStatusResponse(
        total_bays=len(bays), ev_bays=len(ev_bays),
        occupied=len(occupied), solar_kwh_today=solar_kwh,
        bays=[ParkingBayOut.model_validate(b) for b in bays]
    )


@router.get("/commercial/{level}", response_model=List[UnitOut])
def get_commercial_units(level: str, db: Session = Depends(get_db)):
    floor = db.query(Floor).filter(Floor.level_code == level.upper()).first()
    if not floor:
        return []
    return db.query(Unit).filter(Unit.floor_id == floor.id).all()


@router.get("/residential/{level}", response_model=List[UnitOut])
def get_residential_units(level: str, db: Session = Depends(get_db)):
    floor = db.query(Floor).filter(Floor.level_code == level.upper()).first()
    if not floor:
        return []
    return db.query(Unit).filter(Unit.floor_id == floor.id).all()
