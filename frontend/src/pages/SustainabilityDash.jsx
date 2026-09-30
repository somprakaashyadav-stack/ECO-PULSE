import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Sun, Wind, Zap, Leaf, Sliders } from 'lucide-react'
import { fetchSolarDay, fetchLouverImpact, fetchWind, fetchGreenCoverage } from '../utils/api'
import useBuildingStore from '../store/buildingStore'

// ── Tooltip themes ────────────────────────────────────────────────────────────
const TooltipStyle = {
  contentStyle: { background: 'var(--tooltip-bg,#1E293B)', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9' },
  cursor: { fill: 'rgba(34,197,94,0.08)' },
}

// ── Live metrics ticker ────────────────────────────────────────────────────────
function LiveMetric({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="metric-card">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="metric-value">{value}</div>
      <div className="text-xs text-gray-400">{unit}</div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

// ── Wind chart ─────────────────────────────────────────────────────────────────
function WindChart({ data }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
        <Wind size={16} className="text-sky-500" /> Venturi Courtyard Wind Profile
      </h3>
      <p className="text-xs text-gray-400 mb-4">Wind velocity (m/s) at each floor — Venturi effect accelerates airflow as courtyard narrows</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data ?? []} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis type="number" stroke="#64748B" tick={{ fontSize: 11 }} domain={[0, 6]} label={{ value: 'm/s', position: 'right', fill: '#64748B', fontSize: 11 }} />
          <YAxis type="category" dataKey="floor" stroke="#64748B" tick={{ fontSize: 11 }} width={28} />
          <Tooltip {...TooltipStyle} formatter={(v) => [`${v} m/s`, 'Wind Velocity']} />
          <Area type="monotone" dataKey="velocity_ms" fill="#38BDF8" stroke="#0EA5E9" fillOpacity={0.3} strokeWidth={2} />
          <ReferenceLine x={1.5} stroke="#22C55E" strokeDasharray="4 4" label={{ value: 'Comfortable', fill: '#22C55E', fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Louver impact bar chart ────────────────────────────────────────────────────
function LouverChart({ data }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
        <Sliders size={16} className="text-amber-500" /> Kinetic Louver Heat Gain Reduction
      </h3>
      <p className="text-xs text-gray-400 mb-4">Peak summer day (15 May, 1pm). Louver angle vs effective solar heat gain (kWh)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data ?? []} margin={{ left: 0, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis dataKey="louver_angle" stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={v => `${v}°`} />
          <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
          <Tooltip {...TooltipStyle} formatter={(v, n) => [n === 'effective_kwh' ? `${v} kWh (effective)` : `${v} kWh (baseline)`, n === 'effective_kwh' ? 'After Louvers' : 'Before Louvers']} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="heat_gain_kwh" fill="#F59E0B" opacity={0.4} radius={[4,4,0,0]} name="Before Louvers" />
          <Bar dataKey="effective_kwh" fill="#22C55E" radius={[4,4,0,0]} name="After Louvers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Solar day profile ─────────────────────────────────────────────────────────
function SolarDayChart({ data, louverAngle }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
        <Sun size={16} className="text-amber-400" /> Hourly Solar Heat Gain Profile
      </h3>
      <p className="text-xs text-gray-400 mb-4">Today's solar heat gain — blue = baseline, green = after {louverAngle}° louvers</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data ?? []} margin={{ left: 0, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={h => `${h}:00`} />
          <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
          <Tooltip {...TooltipStyle} labelFormatter={h => `${h}:00`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="heat_gain_kwh" stroke="#F59E0B" strokeWidth={2} dot={false} name="Baseline (kWh)" />
          <Line type="monotone" dataKey="effective_gain_kwh" stroke="#22C55E" strokeWidth={2} dot={false} name="With Louvers (kWh)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Green coverage bar chart ───────────────────────────────────────────────────
function GreenCoverageChart({ data }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
        <Leaf size={16} className="text-green-500" /> Green Coverage per Floor
      </h3>
      <p className="text-xs text-gray-400 mb-4">Integrated planter beams, living walls, terraces, and courtyard gardens by floor</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data ?? []} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis type="number" stroke="#64748B" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="floor" stroke="#64748B" tick={{ fontSize: 11 }} width={28} />
          <Tooltip {...TooltipStyle} formatter={(v, n) => [n === 'green_sqm' ? `${v} m²` : `${v}%`, n === 'green_sqm' ? 'Green Area' : 'Coverage %']} />
          <Bar dataKey="green_sqm" fill="#22C55E" radius={[0,4,4,0]} name="Green Area (m²)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SustainabilityDash() {
  const { liveMetrics, louverAngle, solarDate } = useBuildingStore()

  const { data: solarDay } = useQuery({
    queryKey: ['solarDay', solarDate, louverAngle],
    queryFn: () => fetchSolarDay(solarDate, louverAngle),
    retry: 1,
  })
  const { data: louverImpact } = useQuery({ queryKey: ['louverImpact'], queryFn: fetchLouverImpact, retry: 1 })
  const { data: windData } = useQuery({ queryKey: ['wind'], queryFn: fetchWind, retry: 1 })
  const { data: greenData } = useQuery({ queryKey: ['green'], queryFn: fetchGreenCoverage, retry: 1 })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="section-title">Sustainability Dashboard</h1>
        <p className="section-subtitle">Live metrics, solar analysis, Venturi wind model, and green coverage</p>
      </div>

      {/* Live metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <LiveMetric icon={Sun} label="Solar Generation" value={liveMetrics.solar_kwh} unit="kWh today" color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        <LiveMetric icon={Wind} label="Courtyard Wind" value={liveMetrics.wind_speed_ms} unit="m/s average" color="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" />
        <LiveMetric icon={Zap} label="EV Charge Level" value={`${liveMetrics.ev_charge_pct}%`} unit="average across 8 bays" color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <LiveMetric icon={Sliders} label="Heat Gain Reduction" value={`${liveMetrics.heat_gain_reduction_pct}%`} unit="via kinetic louvers" color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
      </div>

      {/* 4 charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SolarDayChart data={solarDay} louverAngle={louverAngle} />
        <LouverChart data={louverImpact} />
        <WindChart data={windData} />
        <GreenCoverageChart data={greenData} />
      </div>

      {/* EV-Solar loop info */}
      <div className="mt-8 card bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-brand-green/30">
        <h3 className="font-display font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Zap className="text-brand-green" size={18} /> EV–Solar Loop
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Rooftop solar panels (48 kWp) power all 8 basement EV charging stations, creating a closed renewable energy loop.
          Excess energy feeds back to the grid.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[['☀️ Solar Input', '48 kWp', 'Peak capacity'], ['⚡ EV Output', '8 Bays', 'DC Fast Charge'], ['♻️ Grid Export', '~12 kWh', 'Daily average']].map(([icon, val, sub]) => (
            <div key={val} className="bg-white/60 dark:bg-black/20 rounded-xl p-3">
              <div className="text-lg">{icon}</div>
              <div className="font-bold text-gray-900 dark:text-white">{val}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
