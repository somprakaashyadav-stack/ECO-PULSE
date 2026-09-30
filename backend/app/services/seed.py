"""
Seed data for the ECO-PULSE B+G+9 building.
Run: python -m app.services.seed  (from backend/)
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database import SessionLocal, engine
from app.models import Base, Floor, Unit, StructuralElement, ParkingBay, MediaAsset

Base.metadata.create_all(bind=engine)

FLOORS = [
    dict(level_code="B1", level_number=-1, use_type="Basement",
         area_sqm=3200, floor_height_mm=3200, unit_count=0,
         has_sky_terrace=False, has_courtyard_view=False,
         green_coverage_sqm=0, description="Car Parking (40 bays) + 8 EV Charging Stations"),
    dict(level_code="G",  level_number=0, use_type="Commercial",
         area_sqm=2800, floor_height_mm=5000, unit_count=8,
         has_sky_terrace=False, has_courtyard_view=True,
         green_coverage_sqm=120, description="Market Hall, Café, Retail Shops – active ground activation"),
    dict(level_code="1F", level_number=1, use_type="Commercial",
         area_sqm=2600, floor_height_mm=4500, unit_count=6,
         has_sky_terrace=False, has_courtyard_view=True,
         green_coverage_sqm=80, description="Community Hall, Co-Working, Café Mezzanine"),
    dict(level_code="2F", level_number=2, use_type="Residential",
         area_sqm=2400, floor_height_mm=3500, unit_count=9,
         has_sky_terrace=False, has_courtyard_view=True,
         green_coverage_sqm=60, description="Residential – 9 Units (mix of 1BHK & 2BHK)"),
    dict(level_code="3F", level_number=3, use_type="Residential+Terrace",
         area_sqm=2400, floor_height_mm=3500, unit_count=8,
         has_sky_terrace=True, has_courtyard_view=True,
         green_coverage_sqm=200, description="Residential + Sky Terrace (Level 1 of 3)"),
    dict(level_code="4F", level_number=4, use_type="Residential",
         area_sqm=2400, floor_height_mm=3500, unit_count=9,
         has_sky_terrace=False, has_courtyard_view=True,
         green_coverage_sqm=60, description="Residential – 9 Units"),
    dict(level_code="5F", level_number=5, use_type="Residential",
         area_sqm=2400, floor_height_mm=3500, unit_count=9,
         has_sky_terrace=False, has_courtyard_view=True,
         green_coverage_sqm=60, description="Residential – 9 Units"),
    dict(level_code="6F", level_number=6, use_type="Residential+Terrace",
         area_sqm=2400, floor_height_mm=3500, unit_count=8,
         has_sky_terrace=True, has_courtyard_view=True,
         green_coverage_sqm=200, description="Residential + Sky Terrace (Level 2 of 3)"),
    dict(level_code="7F", level_number=7, use_type="Residential",
         area_sqm=2400, floor_height_mm=3500, unit_count=9,
         has_sky_terrace=False, has_courtyard_view=True,
         green_coverage_sqm=60, description="Residential – 9 Units"),
    dict(level_code="8F", level_number=8, use_type="Residential",
         area_sqm=2400, floor_height_mm=3500, unit_count=9,
         has_sky_terrace=False, has_courtyard_view=True,
         green_coverage_sqm=60, description="Residential – 9 Units"),
    dict(level_code="9F", level_number=9, use_type="Residential+Terrace",
         area_sqm=2400, floor_height_mm=3500, unit_count=8,
         has_sky_terrace=True, has_courtyard_view=True,
         green_coverage_sqm=250, description="Residential + Rooftop Sky Terrace + Solar Array"),
]

PARKING_ROWS = ["A","B","C","D"]
PARKING_COLS = 10
EV_BAYS = {"A-9","A-10","B-9","B-10","C-9","C-10","D-9","D-10"}

MEDIA_ASSETS = [
    dict(asset_type="render", title="Aerial View", url="/static/renders/aerial.jpg",
         caption="Bird's-eye view of the complete B+G+9 development"),
    dict(asset_type="render", title="Courtyard View", url="/static/renders/courtyard.jpg",
         caption="Central landscaped courtyard with Venturi void"),
    dict(asset_type="render", title="Facade Study – East", url="/static/renders/facade_east.jpg",
         caption="Kinetic louver facade on east elevation"),
    dict(asset_type="render", title="Ground Floor Activation", url="/static/renders/ground.jpg",
         caption="Market hall and café at ground level"),
    dict(asset_type="render", title="Residential Unit Interior", url="/static/renders/interior.jpg",
         caption="Typical 2BHK unit with balcony and courtyard view"),
    dict(asset_type="video", title="30-sec Walkthrough", url="/static/video/walkthrough.mp4",
         caption="Animated walkthrough of the entire building"),
]


def seed():
    db = SessionLocal()
    try:
        # Clear existing
        db.query(ParkingBay).delete()
        db.query(StructuralElement).delete()
        db.query(Unit).delete()
        db.query(Floor).delete()
        db.query(MediaAsset).delete()
        db.commit()

        # Floors
        floor_objects = {}
        for f in FLOORS:
            floor = Floor(**f)
            db.add(floor)
            db.flush()
            floor_objects[f["level_code"]] = floor

        # Residential units (2F–9F)
        res_floors = ["2F","3F","4F","5F","6F","7F","8F","9F"]
        unit_types = ["1BHK","2BHK","2BHK","Studio","1BHK","2BHK","Studio","2BHK","1BHK"]
        for lc in res_floors:
            fl = floor_objects[lc]
            for i in range(fl.unit_count):
                db.add(Unit(
                    floor_id=fl.id,
                    unit_number=f"{lc}-U{i+1:02d}",
                    unit_type=unit_types[i % len(unit_types)],
                    area_sqm=65 + (i % 3) * 20,
                    has_balcony=(i % 2 == 0),
                    courtyard_facing=(i < 5),
                    has_natural_light=True
                ))

        # Commercial units – Ground
        g_floor = floor_objects["G"]
        commercial_units = [
            ("G-R01","Retail","Supermarket",320),("G-R02","Retail","Fashion Store",220),
            ("G-C01","Café","Specialty Coffee",180),("G-R03","Retail","Pharmacy",150),
            ("G-R04","Retail","Electronics",200),("G-C02","Café","Bakery & Patisserie",140),
            ("G-CH","Community","Community Hall",600),("G-SW","Service","Security & Services",80),
        ]
        for num,utype,uname,area in commercial_units:
            db.add(Unit(floor_id=g_floor.id, unit_number=num, unit_type=utype,
                        area_sqm=area, has_balcony=False, courtyard_facing=True))

        # First floor commercial
        f1_floor = floor_objects["1F"]
        f1_units = [
            ("1F-CW","Co-Work","Co-Working Hub",450),("1F-CF","Café","Rooftop Café",220),
            ("1F-CH","Community","Events Hall",480),("1F-GY","Gym","Fitness Studio",280),
            ("1F-RE","Retail","Boutique Retail",180),("1F-SW","Service","Admin Office",120),
        ]
        for num,utype,uname,area in f1_units:
            db.add(Unit(floor_id=f1_floor.id, unit_number=num, unit_type=utype,
                        area_sqm=area, has_balcony=False, courtyard_facing=True))

        # Parking bays
        bay_num = 1
        for row in PARKING_ROWS:
            for col in range(1, PARKING_COLS + 1):
                code = f"{row}-{col}"
                is_ev = code in EV_BAYS
                db.add(ParkingBay(
                    bay_code=code,
                    bay_type="EV" if is_ev else ("Accessible" if col == 1 else "Standard"),
                    is_ev=is_ev,
                    is_occupied=(bay_num % 3 == 0),
                    ev_charge_pct=round(45 + (bay_num * 7) % 55, 1) if is_ev else 0,
                    row_label=row,
                    col_number=col
                ))
                bay_num += 1

        # Structural elements (sample for G floor)
        g_id = g_floor.id
        grids_x = ["A","B","C","D","E"]
        grids_y = ["1","2","3","4","5","6"]
        for x in grids_x:
            for y in grids_y:
                db.add(StructuralElement(
                    floor_id=g_id, element_type="Column",
                    element_id=f"C-{x}{y}", size_mm="500x500",
                    material="M30 RC", load_kn=850.0,
                    rebar_spec="8-T25 + T10@200 ties",
                    grid_x=x, grid_y=y
                ))

        beam_spans = [("A","B"),("B","C"),("C","D"),("D","E")]
        for i,(g1,g2) in enumerate(beam_spans):
            for y in grids_y:
                db.add(StructuralElement(
                    floor_id=g_id, element_type="Beam",
                    element_id=f"B-{g1}{g2}-{y}", size_mm="300x600",
                    material="M30 RC", load_kn=220.0,
                    rebar_spec="4-T20 top, 3-T20 bot + T8@150 stirrups",
                    grid_x=f"{g1}-{g2}", grid_y=y
                ))

        # Media assets
        for m in MEDIA_ASSETS:
            db.add(MediaAsset(**m))

        db.commit()
        print("OK: Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"ERROR: Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
