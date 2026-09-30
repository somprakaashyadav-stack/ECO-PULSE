from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import StructuralElement, Floor
from app.schemas import StructuralElementOut
from typing import List, Optional

router = APIRouter(prefix="/api/structural", tags=["Structural"])


@router.get("/elements", response_model=List[StructuralElementOut])
def get_all_elements(
    element_type: Optional[str] = None,
    floor_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(StructuralElement)
    if element_type:
        query = query.filter(StructuralElement.element_type == element_type)
    if floor_level:
        floor = db.query(Floor).filter(Floor.level_code == floor_level.upper()).first()
        if floor:
            query = query.filter(StructuralElement.floor_id == floor.id)
    return query.all()


@router.get("/columns", response_model=List[StructuralElementOut])
def get_columns(db: Session = Depends(get_db)):
    return db.query(StructuralElement).filter(
        StructuralElement.element_type == "Column"
    ).all()


@router.get("/beams", response_model=List[StructuralElementOut])
def get_beams(db: Session = Depends(get_db)):
    return db.query(StructuralElement).filter(
        StructuralElement.element_type == "Beam"
    ).all()


@router.get("/summary")
def get_structural_summary():
    return {
        "structural_system": "Reinforced Concrete Frame",
        "grade_concrete": "M30",
        "grade_steel": "Fe500",
        "column": {"size_mm": "500x500", "main_bars": "8-T25", "ties": "T10@200mm"},
        "beam": {"size_mm": "300x600", "top_bars": "4-T20", "bottom_bars": "3-T20", "stirrups": "T8@150mm"},
        "slab": {"thickness_mm": 150, "rebar": "T10@200 BW", "type": "Two-way RC Slab"},
        "foundation": "Raft Foundation – 800mm thick, M35",
        "grid_spacing_mm": {"x": 7200, "y": 7200},
        "seismic_zone": "Zone III (IS 1893)",
        "wind_zone": "Zone II (IS 875)",
    }
