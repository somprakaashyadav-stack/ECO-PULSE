from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Floor, ParkingBay
from app.schemas import BuildingOverview, FloorOut, ParkingBayOut
from typing import List

router = APIRouter(prefix="/api/building", tags=["Building"])


@router.get("/overview", response_model=BuildingOverview)
def get_overview(db: Session = Depends(get_db)):
    floors = db.query(Floor).all()
    bays = db.query(ParkingBay).all()
    ev_bays = [b for b in bays if b.is_ev]
    total_units = sum(f.unit_count for f in floors)
    total_area = sum(f.area_sqm for f in floors)
    green = sum(f.green_coverage_sqm for f in floors)
    terraces = [f.level_code for f in floors if f.has_sky_terrace]
    return BuildingOverview(
        project_name="ECO-PULSE – Urban Mixed-Use Development",
        total_floors=len(floors),
        basement_floors=1,
        commercial_floors=2,
        residential_floors=8,
        total_units=total_units,
        total_area_sqm=round(total_area, 1),
        parking_bays=len(bays),
        ev_bays=len(ev_bays),
        green_coverage_sqm=round(green, 1),
        sky_terraces=terraces,
        structural_system="Reinforced Concrete Frame – M30/Fe500: 500×500 Cols, 300×600 Beams, 150mm Slab"
    )


@router.get("/floors", response_model=List[FloorOut])
def get_floors(db: Session = Depends(get_db)):
    return db.query(Floor).order_by(Floor.level_number).all()


@router.get("/floors/{level_code}", response_model=FloorOut)
def get_floor(level_code: str, db: Session = Depends(get_db)):
    return db.query(Floor).filter(Floor.level_code == level_code.upper()).first()
