import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useBuildingStore = create(
  persist(
    (set, get) => ({
      // ── Theme ────────────────────────────────────────────────────────
      isDark: false,
      toggleDark: () => {
        const next = !get().isDark
        set({ isDark: next })
        document.documentElement.classList.toggle('dark', next)
      },
      initTheme: () => {
        const stored = get().isDark
        document.documentElement.classList.toggle('dark', stored)
      },

      // ── Active floor (B1="-1", G="0", 1F="1" ... 9F="9") ────────────
      activeFloor: 'G',
      setActiveFloor: (floor) => set({ activeFloor: floor }),

      // ── 3D viewer layers ─────────────────────────────────────────────
      layers: {
        structure: true,
        greenSpine: true,
        facade: true,
        courtyard: true,
      },
      toggleLayer: (layer) =>
        set((s) => ({ layers: { ...s.layers, [layer]: !s.layers[layer] } })),

      // ── Facade louver angle (0–90 degrees) ───────────────────────────
      louverAngle: 45,
      setLouverAngle: (angle) => set({ louverAngle: angle }),

      // ── Solar date/hour picker ────────────────────────────────────────
      solarDate: new Date().toISOString().split('T')[0],
      solarHour: 12,
      setSolarDate: (d) => set({ solarDate: d }),
      setSolarHour: (h) => set({ solarHour: h }),

      // ── Sidebar open/closed ───────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // ── Live metrics (from WebSocket) ─────────────────────────────────
      liveMetrics: {
        solar_kwh: 0,
        wind_speed_ms: 0,
        ev_charge_pct: 0,
        louver_angle: 45,
        heat_gain_reduction_pct: 35,
      },
      setLiveMetrics: (metrics) => set({ liveMetrics: metrics }),
    }),
    {
      name: 'ecopulse-store',
      partialize: (s) => ({ isDark: s.isDark, louverAngle: s.louverAngle }),
    }
  )
)

export default useBuildingStore
