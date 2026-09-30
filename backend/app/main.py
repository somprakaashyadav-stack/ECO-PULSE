from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio, json, datetime, math, os

from app.config import settings
from app.database import engine
from app.models import Base
from app.routers import building, floors, sustainability, structural, media

# Create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="ECO-PULSE B+G+9 Mixed-Use BIM API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS – allow the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (renders, videos)
if os.path.exists(settings.STATIC_DIR):
    app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Include routers
app.include_router(building.router)
app.include_router(floors.router)
app.include_router(sustainability.router)
app.include_router(structural.router)
app.include_router(media.router)


@app.get("/")
def root():
    return {
        "project": "ECO-PULSE",
        "status": "running",
        "docs": "/api/docs",
        "version": "1.0.0"
    }


# ── WebSocket: Real-time metrics ───────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, data: dict):
        disconnected = []
        for ws in self.active:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self.active.remove(ws)


manager = ConnectionManager()


async def metrics_generator():
    """Generates live sustainability metrics every 5 seconds."""
    while True:
        now = datetime.datetime.now()
        hour = now.hour
        minute = now.minute

        # Solar simulation
        solar_factor = max(0, math.sin(math.pi * (hour - 6) / 12)) if 6 <= hour <= 18 else 0
        solar_kwh = round(48 * solar_factor + (minute / 60) * 2, 2)

        # Wind speed (Venturi mid-building avg)
        wind = round(2.5 + 1.2 * math.sin(now.timestamp() / 300), 2)

        # EV charge progress
        ev_charge_pct = round(min(100, 40 + solar_kwh * 0.8), 1)

        payload = {
            "timestamp": now.isoformat(),
            "solar_kwh": solar_kwh,
            "wind_speed_ms": wind,
            "ev_charge_pct": ev_charge_pct,
            "louver_angle": 45,
            "heat_gain_reduction_pct": 35,
        }
        await manager.broadcast(payload)
        await asyncio.sleep(5)


@app.on_event("startup")
async def startup():
    asyncio.create_task(metrics_generator())


@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)
