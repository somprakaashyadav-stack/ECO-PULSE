from fastapi import APIRouter, Query
from datetime import date
from app.services.sustainability_engine import (
    calculate_solar, calculate_venturi_wind, get_all_floors_wind
)
from app.schemas import SolarResponse, WindResponse
from typing import List

router = APIRouter(prefix="/api/sustainability", tags=["Sustainability"])


@router.get("/solar", response_model=SolarResponse)
def get_solar(
    query_date: str = Query(default=str(date.today()), alias="date"),
    hour: int = Query(default=12, ge=0, le=23),
    louver_angle: float = Query(default=45.0, ge=0, le=90)
):
    return calculate_solar(query_date, hour, louver_angle)


@router.get("/solar/day-profile")
def get_solar_day_profile(
    query_date: str = Query(default=str(date.today()), alias="date"),
    louver_angle: float = Query(default=45.0, ge=0, le=90)
):
    """Returns hourly solar data for a full day (6am–6pm)."""
    results = []
    for hour in range(6, 19):
        r = calculate_solar(query_date, hour, louver_angle)
        results.append(r.model_dump())
    return results


@router.get("/wind", response_model=List[WindResponse])
def get_wind_all_floors():
    return get_all_floors_wind()


@router.get("/wind/{floor_level}", response_model=WindResponse)
def get_wind_floor(floor_level: int):
    return calculate_venturi_wind(floor_level)


@router.get("/louver-impact")
def get_louver_impact():
    """Compare heat gain at different louver angles for a peak summer day."""
    peak_date = str(date.today().replace(month=5, day=15))
    angles = [0, 15, 30, 45, 60, 75, 90]
    results = []
    for angle in angles:
        r = calculate_solar(peak_date, 13, angle)
        results.append({
            "louver_angle": angle,
            "heat_gain_kwh": r.heat_gain_kwh,
            "reduction_pct": r.louver_reduction_pct,
            "effective_kwh": r.effective_gain_kwh,
        })
    return results


@router.get("/green-coverage")
def get_green_coverage():
    """Green coverage per floor."""
    from app.database import SessionLocal
    from app.models import Floor
    db = SessionLocal()
    floors = db.query(Floor).order_by(Floor.level_number).all()
    db.close()
    return [
        {"floor": f.level_code, "green_sqm": f.green_coverage_sqm,
         "total_area": f.area_sqm,
         "coverage_pct": round(f.green_coverage_sqm / f.area_sqm * 100, 1)}
        for f in floors
    ]
