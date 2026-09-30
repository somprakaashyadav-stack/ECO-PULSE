from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Floor ──────────────────────────────────────────────
class FloorBase(BaseModel):
    level_code: str
    level_number: int
    use_type: str
    area_sqm: float
    floor_height_mm: int
    unit_count: int
    has_sky_terrace: bool
    has_courtyard_view: bool
    green_coverage_sqm: float
    description: str

class FloorOut(FloorBase):
    id: int
    class Config:
        from_attributes = True


# ── Unit ───────────────────────────────────────────────
class UnitOut(BaseModel):
    id: int
    unit_number: str
    unit_type: str
    area_sqm: float
    has_balcony: bool
    courtyard_facing: bool
    has_natural_light: bool
    class Config:
        from_attributes = True


# ── Structural ─────────────────────────────────────────
class StructuralElementOut(BaseModel):
    id: int
    element_type: str
    element_id: str
    size_mm: str
    material: str
    load_kn: float
    rebar_spec: str
    grid_x: str
    grid_y: str
    class Config:
        from_attributes = True


# ── Parking ────────────────────────────────────────────
class ParkingBayOut(BaseModel):
    id: int
    bay_code: str
    bay_type: str
    is_ev: bool
    is_occupied: bool
    ev_charge_pct: float
    row_label: str
    col_number: int
    class Config:
        from_attributes = True


# ── Media ──────────────────────────────────────────────
class MediaAssetOut(BaseModel):
    id: int
    asset_type: str
    title: str
    url: str
    caption: str
    uploaded_at: datetime
    class Config:
        from_attributes = True


# ── Sustainability ─────────────────────────────────────
class SustainabilityMetricOut(BaseModel):
    id: int
    metric_type: str
    value: float
    unit: str
    recorded_at: datetime
    class Config:
        from_attributes = True


# ── Live response payloads ─────────────────────────────
class SolarResponse(BaseModel):
    date: str
    hour: int
    azimuth: float
    altitude: float
    heat_gain_kwh: float
    louver_reduction_pct: float
    effective_gain_kwh: float

class WindResponse(BaseModel):
    floor: str
    velocity_ms: float
    venturi_boost: float
    comfort_level: str

class EVStatusResponse(BaseModel):
    total_bays: int
    ev_bays: int
    occupied: int
    solar_kwh_today: float
    bays: List[ParkingBayOut]

class BuildingOverview(BaseModel):
    project_name: str
    total_floors: int
    basement_floors: int
    commercial_floors: int
    residential_floors: int
    total_units: int
    total_area_sqm: float
    parking_bays: int
    ev_bays: int
    green_coverage_sqm: float
    sky_terraces: List[str]
    structural_system: str
