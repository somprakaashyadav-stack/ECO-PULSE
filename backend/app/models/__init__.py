from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Floor(Base):
    __tablename__ = "floors"
    id = Column(Integer, primary_key=True, index=True)
    level_code = Column(String, unique=True, index=True)  # "B1","G","1F",...,"9F"
    level_number = Column(Integer)                         # -1,0,1,...,9
    use_type = Column(String)                              # "Basement","Commercial","Residential","Terrace"
    area_sqm = Column(Float, default=2500.0)
    floor_height_mm = Column(Integer, default=3500)
    unit_count = Column(Integer, default=0)
    has_sky_terrace = Column(Boolean, default=False)
    has_courtyard_view = Column(Boolean, default=True)
    green_coverage_sqm = Column(Float, default=0.0)
    description = Column(String, default="")

    units = relationship("Unit", back_populates="floor")
    structural_elements = relationship("StructuralElement", back_populates="floor")


class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    floor_id = Column(Integer, ForeignKey("floors.id"))
    unit_number = Column(String)
    unit_type = Column(String)       # "1BHK","2BHK","Studio","Retail","Cafe","Community"
    area_sqm = Column(Float)
    has_balcony = Column(Boolean, default=False)
    courtyard_facing = Column(Boolean, default=True)
    has_natural_light = Column(Boolean, default=True)

    floor = relationship("Floor", back_populates="units")


class StructuralElement(Base):
    __tablename__ = "structural_elements"
    id = Column(Integer, primary_key=True, index=True)
    floor_id = Column(Integer, ForeignKey("floors.id"))
    element_type = Column(String)    # "Column","Beam","Slab"
    element_id = Column(String)      # "C-A1","B-12" etc.
    size_mm = Column(String)         # "500x500","300x600","150"
    material = Column(String, default="M30 RC")
    load_kn = Column(Float, default=0.0)
    rebar_spec = Column(String, default="")
    grid_x = Column(String, default="")
    grid_y = Column(String, default="")

    floor = relationship("Floor", back_populates="structural_elements")


class ParkingBay(Base):
    __tablename__ = "parking_bays"
    id = Column(Integer, primary_key=True, index=True)
    bay_code = Column(String, unique=True)
    bay_type = Column(String, default="Standard")   # "Standard","Accessible","EV"
    is_ev = Column(Boolean, default=False)
    is_occupied = Column(Boolean, default=False)
    ev_charge_pct = Column(Float, default=0.0)
    row_label = Column(String)
    col_number = Column(Integer)


class MediaAsset(Base):
    __tablename__ = "media_assets"
    id = Column(Integer, primary_key=True, index=True)
    asset_type = Column(String)     # "render","video","document","diagram"
    title = Column(String)
    url = Column(String)
    caption = Column(String, default="")
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class SustainabilityMetric(Base):
    __tablename__ = "sustainability_metrics"
    id = Column(Integer, primary_key=True, index=True)
    metric_type = Column(String)    # "solar_kwh","ev_charge","wind_speed","green_sqm"
    value = Column(Float)
    unit = Column(String)
    recorded_at = Column(DateTime, default=datetime.utcnow)
