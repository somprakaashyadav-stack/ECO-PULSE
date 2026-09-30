# ECO-PULSE 🌿 — Urban Mixed-Use Design Platform

> **B+G+9 Mixed-Use BIM Showcase Web Application**  
> Built for the *Urban Mixed-Use Design Challenge* — Autodesk Revit + BIM presentation platform

---

## 🏙️ Project Overview

ECO-PULSE is a full-stack web prototype for presenting a **B+G+9 mixed-use building** design — featuring:
- **Basement (B1):** 40 Car Parking Bays + 8 Solar-Powered EV Charging Stations  
- **Ground + 1st Floor:** Retail, Café, Community Hall, Co-Working  
- **2nd–9th Floor:** ~72 Residential Units (1BHK, 2BHK, Studio)  
- **Sky Terraces at 3F, 6F, 9F:** Shared green decks + fire refuge  
- **Kinetic Facade Louvers:** East/West, pivot 0°–90°, reduce heat gain ~35%  
- **Central Venturi Courtyard:** Physics-driven natural ventilation  
- **EV–Solar Loop:** 48 kWp rooftop solar powers basement EV bays  

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS (Dark/Light mode) |
| 3D Viewer | Three.js + React Three Fiber |
| State | Zustand (persisted) |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | FastAPI (Python) |
| Database | SQLite → PostgreSQL |
| Real-time | WebSocket (live solar/EV/wind metrics) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ and npm
- Python 3.11+

### 1. Clone the repo
```bash
git clone https://github.com/somprakaashyadav-stack/ECO-PULSE.git
cd ECO-PULSE
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m app.services.seed        # Seed the database
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:8000/api/docs

---

## 📄 Pages

| Page | Route | Description |
|------|-------|-------------|
| Overview | `/` | Hero, stats, floor programme, innovation features |
| 3D Explorer | `/explorer` | Interactive Three.js building model |
| Floor Plans | `/floors` | Basement parking, commercial & residential layouts |
| Sustainability | `/sustainability` | Solar, wind, EV, green coverage dashboards |
| Structural | `/structural` | RC frame plan, column/beam schedules, rebar specs |
| Gallery | `/gallery` | Render carousel, walkthrough video |

---

## 🌗 Dark / Light Mode

Click the **Moon/Sun icon** in the navbar to toggle. Preference is persisted in localStorage.

---

## 📁 Project Structure

```
ECO-PULSE/
├── frontend/           # React + Vite + Tailwind
│   └── src/
│       ├── pages/      # 6 route pages
│       ├── components/ # Navbar, 3D building model
│       ├── store/      # Zustand global state
│       ├── hooks/      # WebSocket realtime hook
│       └── utils/      # Axios API client
└── backend/            # FastAPI
    └── app/
        ├── models/     # SQLAlchemy ORM models
        ├── routers/    # API route handlers
        ├── services/   # Solar engine, Venturi model, seeder
        └── schemas/    # Pydantic schemas
```

---

## 🌿 Key Features

- **Venturi Courtyard** — Wind accelerates through tapering void (physics model)
- **Kinetic Louvers** — Interactive slider controls facade shading
- **Live Metrics** — WebSocket pushes real-time solar/EV/wind data every 5s
- **Structural Drawings** — SVG RC frame plan + element schedule table
- **Responsive + Accessible** — Mobile-friendly, keyboard navigable

---

## 📜 License

MIT — built for educational / competition purposes.
