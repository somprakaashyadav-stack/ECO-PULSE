import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { fetchBasement, fetchCommercial, fetchResidential } from '../utils/api'

const FLOORS_LIST = [
  { code: 'B1', label: 'Basement – B1', type: 'basement' },
  { code: 'G',  label: 'Ground Floor',  type: 'commercial' },
  { code: '1F', label: '1st Floor',     type: 'commercial' },
  { code: '2F', label: '2nd Floor',     type: 'residential' },
  { code: '3F', label: '3rd Floor + Sky Terrace', type: 'residential' },
  { code: '4F', label: '4th Floor',     type: 'residential' },
  { code: '5F', label: '5th Floor',     type: 'residential' },
  { code: '6F', label: '6th Floor + Sky Terrace', type: 'residential' },
  { code: '7F', label: '7th Floor',     type: 'residential' },
  { code: '8F', label: '8th Floor',     type: 'residential' },
  { code: '9F', label: '9th Floor + Rooftop', type: 'residential' },
]

// ── Basement Plan SVG ─────────────────────────────────────────────────────────
function BasementPlan({ data }) {
  const bays = data?.bays ?? []
  const rows = ['A','B','C','D']
  const cols = 10

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-display font-bold text-gray-900 dark:text-white">{data?.total_bays ?? 40}</div>
          <div className="text-sm text-gray-500">Total Bays</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-display font-bold text-brand-green">{data?.ev_bays ?? 8}</div>
          <div className="text-sm text-gray-500">EV Charging Bays</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-display font-bold text-amber-500">{data?.solar_kwh_today ?? '—'} kWh</div>
          <div className="text-sm text-gray-500">Solar Today</div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Parking Bay Layout (B1)</div>

        {/* Ramp indicator */}
        <div className="w-full text-center mb-4">
          <div className="inline-block bg-gray-300 dark:bg-gray-600 rounded px-6 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            ↑ VEHICLE RAMP ENTRY / EXIT ↑
          </div>
        </div>

        <div className="space-y-2">
          {rows.map(row => (
            <div key={row} className="flex items-center gap-2">
              <div className="w-6 text-xs font-bold text-gray-500 dark:text-gray-400 text-center">{row}</div>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: cols }, (_, i) => {
                  const code = `${row}-${i + 1}`
                  const bay = bays.find(b => b.bay_code === code)
                  const isEV = bay?.is_ev ?? false
                  const isOcc = bay?.is_occupied ?? false
                  const isAccess = bay?.bay_type === 'Accessible'

                  let cls = 'bay-standard'
                  if (isEV && isOcc) cls = 'bay-ev-active'
                  else if (isEV) cls = 'bay-ev'
                  else if (isOcc) cls = 'bay-occupied'
                  else if (isAccess) cls = 'bay-accessible'

                  return (
                    <div key={code} className={`${cls} w-12 h-10`} title={code}>
                      <div className="text-[9px]">{code}</div>
                      {isEV && <div className="text-[9px]">⚡</div>}
                      {isOcc && !isEV && <div className="text-[9px]">🚗</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs">
          {[
            { cls:'bay-standard w-6 h-5', label:'Available' },
            { cls:'bay-occupied w-6 h-5', label:'Occupied' },
            { cls:'bay-ev w-6 h-5', label:'EV Charging' },
            { cls:'bay-ev-active w-6 h-5', label:'EV + Charging' },
            { cls:'bay-accessible w-6 h-5', label:'Accessible' },
          ].map(({ cls, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cls} />
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Commercial Plan SVG ───────────────────────────────────────────────────────
function CommercialPlan({ units = [], level }) {
  const colorMap = {
    Retail: 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-400',
    Café: 'bg-orange-100 dark:bg-orange-900/30 border-orange-400 text-orange-700 dark:text-orange-400',
    Community: 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 text-purple-600 dark:text-purple-400',
    'Co-Work': 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-400',
    Gym: 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-400',
    Service: 'bg-gray-100 dark:bg-gray-700 border-gray-400 text-gray-600 dark:text-gray-400',
  }

  return (
    <div>
      {/* Courtyard indicator */}
      <div className="card mb-4 text-center border-2 border-dashed border-brand-green/40">
        <div className="text-brand-green font-bold">🌿 Central Landscaped Courtyard</div>
        <div className="text-xs text-gray-400 mt-1">24m × 18m · Natural Light & Venturi Ventilation</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {units.map(unit => {
          const cls = colorMap[unit.unit_type] ?? colorMap.Service
          return (
            <div key={unit.id} className={`rounded-xl border-2 p-4 ${cls}`}>
              <div className="font-bold text-sm">{unit.unit_number}</div>
              <div className="text-xs font-medium uppercase tracking-wider mt-0.5 opacity-70">{unit.unit_type}</div>
              <div className="mt-2 text-lg font-display font-bold">{unit.area_sqm} m²</div>
              {unit.courtyard_facing && (
                <div className="text-xs mt-1 opacity-70">🌿 Courtyard facing</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Residential Plan ──────────────────────────────────────────────────────────
function ResidentialPlan({ units = [], level }) {
  const typeColors = {
    '1BHK':  'bg-green-100 dark:bg-green-900/30 border-green-400',
    '2BHK':  'bg-teal-100 dark:bg-teal-900/30 border-teal-400',
    'Studio':'bg-sky-100 dark:bg-sky-900/30 border-sky-400',
  }
  const isTerrace = ['3F','6F','9F'].includes(level)

  return (
    <div>
      {isTerrace && (
        <div className="card mb-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-300 dark:border-teal-700">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold">
            🌿 Sky Terrace Floor
            <span className="badge bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-300">200–250 m²</span>
          </div>
          <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
            Shared green deck with seating, planters, and fire refuge zone
          </div>
        </div>
      )}

      {/* Unit count summary */}
      <div className="flex gap-3 mb-4">
        {['1BHK','2BHK','Studio'].map(t => {
          const count = units.filter(u => u.unit_type === t).length
          return count > 0 ? (
            <div key={t} className={`rounded-xl border-2 px-4 py-2 text-center ${typeColors[t]}`}>
              <div className="text-xl font-bold">{count}</div>
              <div className="text-xs font-medium">{t}</div>
            </div>
          ) : null
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {units.map(unit => {
          const cls = typeColors[unit.unit_type] ?? 'bg-gray-100 border-gray-300'
          return (
            <div key={unit.id} className={`rounded-xl border-2 p-3 ${cls}`}>
              <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{unit.unit_number}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{unit.unit_type}</div>
              <div className="mt-2 text-base font-display font-bold text-gray-900 dark:text-white">{unit.area_sqm} m²</div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {unit.has_balcony && <span className="text-[10px] bg-white/60 dark:bg-black/30 rounded px-1.5 py-0.5">🌅 Balcony</span>}
                {unit.courtyard_facing && <span className="text-[10px] bg-white/60 dark:bg-black/30 rounded px-1.5 py-0.5">🌿 Court</span>}
                {unit.has_natural_light && <span className="text-[10px] bg-white/60 dark:bg-black/30 rounded px-1.5 py-0.5">☀️ Light</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main FloorPlanner page ────────────────────────────────────────────────────
export default function FloorPlanner() {
  const [selected, setSelected] = useState('B1')
  const fl = FLOORS_LIST.find(f => f.code === selected)

  const { data: basementData } = useQuery({
    queryKey: ['basement'],
    queryFn: fetchBasement,
    enabled: selected === 'B1',
    retry: 1,
  })
  const { data: commercialData } = useQuery({
    queryKey: ['commercial', selected],
    queryFn: () => fetchCommercial(selected),
    enabled: ['G','1F'].includes(selected),
    retry: 1,
  })
  const { data: residentialData } = useQuery({
    queryKey: ['residential', selected],
    queryFn: () => fetchResidential(selected),
    enabled: !['B1','G','1F'].includes(selected),
    retry: 1,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="section-title">Floor Plans</h1>
        <p className="section-subtitle">Click any floor to view its layout — Basement to 9th Floor</p>
      </div>

      {/* Floor selector row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8">
        {FLOORS_LIST.map(fl => (
          <button
            key={fl.code}
            onClick={() => setSelected(fl.code)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
              selected === fl.code
                ? 'bg-brand-green border-brand-green text-white shadow-md shadow-green-400/30'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-green hover:text-brand-green bg-white dark:bg-gray-800'
            }`}
          >
            {fl.code}
          </button>
        ))}
      </div>

      {/* Active floor title */}
      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">{fl?.label}</h2>
          <span className={`badge ${fl?.type === 'basement' ? 'badge-sky' : fl?.type === 'commercial' ? 'badge-amber' : 'badge-green'}`}>
            {fl?.type}
          </span>
        </div>
      </motion.div>

      {/* Floor content */}
      <motion.div key={`content-${selected}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {selected === 'B1' && <BasementPlan data={basementData} />}
        {['G','1F'].includes(selected) && <CommercialPlan units={commercialData ?? []} level={selected} />}
        {!['B1','G','1F'].includes(selected) && <ResidentialPlan units={residentialData ?? []} level={selected} />}
      </motion.div>
    </div>
  )
}
