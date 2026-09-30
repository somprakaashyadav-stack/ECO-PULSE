import math
from datetime import datetime, date
from typing import List
from app.schemas import SolarResponse, WindResponse


def calculate_solar(query_date: str, hour: int, louver_angle: float = 45.0) -> SolarResponse:
    """
    Simplified solar position calculation for Pune, India (18.52°N, 73.85°E).
    Uses astronomical formulas – no external API needed.
    """
    LAT = 18.52
    LON = 73.85

    try:
        d = datetime.strptime(query_date, "%Y-%m-%d").date()
    except Exception:
        d = date.today()

    # Day of year
    day_of_year = d.timetuple().tm_yday

    # Declination angle
    declination = 23.45 * math.sin(math.radians(360 / 365 * (day_of_year - 81)))

    # Hour angle (solar noon = 0)
    hour_angle = (hour - 12) * 15

    # Altitude angle
    alt_rad = math.asin(
        math.sin(math.radians(LAT)) * math.sin(math.radians(declination))
        + math.cos(math.radians(LAT)) * math.cos(math.radians(declination))
        * math.cos(math.radians(hour_angle))
    )
    altitude = math.degrees(alt_rad)

    # Azimuth
    if altitude > 0:
        cos_az = (
            math.sin(math.radians(declination)) - math.sin(math.radians(LAT)) * math.sin(alt_rad)
        ) / (math.cos(math.radians(LAT)) * math.cos(alt_rad))
        cos_az = max(-1, min(1, cos_az))
        azimuth = math.degrees(math.acos(cos_az))
        if hour_angle > 0:
            azimuth = 360 - azimuth
    else:
        azimuth = 0.0
        altitude = 0.0

    # Heat gain calculation (simplified ASHRAE model)
    if altitude > 0:
        base_irradiance = 1000 * math.sin(alt_rad)  # W/m²
        glazing_area = 800  # m² facade glazing
        shgc = 0.6
        heat_gain_kwh = (base_irradiance * glazing_area * shgc) / 1_000_000 * 1000  # kWh approximation
    else:
        heat_gain_kwh = 0.0

    # Louver reduction: 0° = 0% reduction, 90° = 70% reduction
    louver_reduction_pct = (louver_angle / 90) * 70
    effective_gain = heat_gain_kwh * (1 - louver_reduction_pct / 100)

    return SolarResponse(
        date=query_date,
        hour=hour,
        azimuth=round(azimuth, 2),
        altitude=round(altitude, 2),
        heat_gain_kwh=round(heat_gain_kwh, 3),
        louver_reduction_pct=round(louver_reduction_pct, 1),
        effective_gain_kwh=round(effective_gain, 3),
    )


def calculate_venturi_wind(floor_level: int) -> WindResponse:
    """
    Venturi courtyard wind model.
    Courtyard narrows from 24m (ground) to 12m (level 5+),
    accelerating airflow per continuity equation.
    """
    BASE_WIND = 2.5  # m/s ambient at site

    # Bernoulli-simplified: v2 = v1 * (A1/A2)
    courtyard_width_ground = 24.0  # metres
    courtyard_width_upper = max(12.0, 24.0 - floor_level * 1.2)
    venturi_boost = courtyard_width_ground / courtyard_width_upper
    velocity = BASE_WIND * venturi_boost

    level_code_map = {-1:"B1", 0:"G", 1:"1F", 2:"2F", 3:"3F", 4:"4F",
                       5:"5F", 6:"6F", 7:"7F", 8:"8F", 9:"9F"}
    level_code = level_code_map.get(floor_level, str(floor_level))

    # Thermal comfort classification (ASHRAE 55)
    if velocity < 0.2:
        comfort = "Still – Uncomfortable"
    elif velocity < 0.8:
        comfort = "Calm – Comfortable"
    elif velocity < 1.5:
        comfort = "Breezy – Pleasant"
    elif velocity < 2.5:
        comfort = "Windy – Acceptable"
    else:
        comfort = "Strong – Stimulating"

    return WindResponse(
        floor=level_code,
        velocity_ms=round(velocity, 2),
        venturi_boost=round(venturi_boost, 2),
        comfort_level=comfort,
    )


def get_all_floors_wind() -> List[WindResponse]:
    return [calculate_venturi_wind(lvl) for lvl in range(-1, 10)]
