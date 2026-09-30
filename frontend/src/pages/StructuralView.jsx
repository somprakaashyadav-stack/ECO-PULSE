import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Cpu, Grid, Layers } from 'lucide-react'
import { fetchStructuralSummary, fetchColumns, fetchBeams } from '../utils/api'

// RC Frame SVG Plan (schematic)
function RCFramePlan({ columns, beams }) {
  const GRIDS_X = ['A','B','C','D','E']
  const GRIDS_Y = ['1','2','3','4','5','6']
  const CELL = 60
  const PAD = 40

  const w = (GRIDS_X.length - 1) * CELL + PAD * 2
  const h = (GRIDS_Y.length - 1) * CELL + PAD * 2

  return (
    <svg width={w} height={h} className="w-full max-w-lg mx-auto" viewBox={`0 0 ${w} ${h}`}>
      {/* Grid lines */}
      {GRIDS_X.map((x, xi) => (
        <line key={`vx-${x}`}
          x1={PAD + xi * CELL} y1={PAD}
          x2={PAD + xi * CELL} y2={PAD + (GRIDS_Y.length - 1) * CELL}
          stroke="#334155" strokeWidth={1} strokeDasharray="4,3" />
      ))}
      {GRIDS_Y.map((y, yi) => (
        <line key={`hy-${y}`}
          x1={PAD} y1={PAD + yi * CELL}
          x2={PAD + (GRIDS_X.length - 1) * CELL} y2={PAD + yi * CELL}
          stroke="#334155" strokeWidth={1} strokeDasharray="4,3" />
      ))}

      {/* Beams horizontal */}
      {GRIDS_Y.map((y, yi) => (
        <rect key={`beam-h-${yi}`}
          x={PAD + 3} y={PAD + yi * CELL - 5}
          width={(GRIDS_X.length - 1) * CELL - 6} height={10}
          rx={2} fill="#F59E0B" opacity={0.5} />
      ))}
      {/* Beams vertical */}
      {GRIDS_X.map((x, xi) => (
        <rect key={`beam-v-${xi}`}
          x={PAD + xi * CELL - 5} y={PAD + 3}
          width={10} height={(GRIDS_Y.length - 1) * CELL - 6}
          rx={2} fill="#F59E0B" opacity={0.5} />
      ))}

      {/* Columns */}
      {GRIDS_X.map((x, xi) =>
        GRIDS_Y.map((y, yi) => (
          <rect key={`col-${x}${y}`}
            x={PAD + xi * CELL - 7} y={PAD + yi * CELL - 7}
            width={14} height={14} rx={2}
            fill="#22C55E" stroke="#16A34A" strokeWidth={1.5} />
        ))
      )}

      {/* Grid labels X */}
      {GRIDS_X.map((x, xi) => (
        <text key={`lx-${x}`}
          x={PAD + xi * CELL} y={PAD - 12}
          textAnchor="middle" fontSize={11} fill="#64748B" fontWeight="600">{x}</text>
      ))}
      {/* Grid labels Y */}
      {GRIDS_Y.map((y, yi) => (
        <text key={`ly-${y}`}
          x={PAD - 14} y={PAD + yi * CELL + 4}
          textAnchor="middle" fontSize={11} fill="#64748B" fontWeight="600">{y}</text>
      ))}

      {/* Courtyard void */}
      <rect x={PAD + 1.5 * CELL - 18} y={PAD + 1.5 * CELL - 18}
        width={CELL * 2 + 36} height={CELL * 2 + 36}
        rx={4} fill="none" stroke="#22C55E" strokeWidth={2}
        strokeDasharray="8,4" opacity={0.8} />
      <text x={PAD + 2.5 * CELL} y={PAD + 2.5 * CELL + 4}
        textAnchor="middle" fontSize={9} fill="#22C55E" fontWeight="700">COURTYARD</text>
    </svg>
  )
}

export default function StructuralView() {
  const [activeTab, setActiveTab] = useState('overview')
  const { data: summary } = useQuery({ queryKey: ['structSummary'], queryFn: fetchStructuralSummary, retry: 1 })
  const { data: columns } = useQuery({ queryKey: ['columns'], queryFn: fetchColumns, retry: 1 })
  const { data: beams } = useQuery({ queryKey: ['beams'], queryFn: fetchBeams, retry: 1 })

  const tabs = [
    { key: 'overview', label: 'Summary', icon: Cpu },
    { key: 'plan',     label: 'RC Frame Plan', icon: Grid },
    { key: 'schedule', label: 'Element Schedule', icon: Layers },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="section-title">Structural Drawings</h1>
        <p className="section-subtitle">RC Frame system: columns, beams, slabs, rebar detailing — IS 456 / IS 1893</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Summary tab */}
      {activeTab === 'overview' && summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: '🏛️ Columns', color: 'border-green-500 bg-green-50 dark:bg-green-900/20',
                specs: [['Size', summary.column?.size_mm],['Main Bars', summary.column?.main_bars],['Ties', summary.column?.ties],['Grade', summary.grade_concrete]] },
              { title: '🔧 Beams', color: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
                specs: [['Size', summary.beam?.size_mm],['Top Bars', summary.beam?.top_bars],['Bottom', summary.beam?.bottom_bars],['Stirrups', summary.beam?.stirrups]] },
              { title: '📋 Slab', color: 'border-sky-500 bg-sky-50 dark:bg-sky-900/20',
                specs: [['Thickness', `${summary.slab?.thickness_mm} mm`],['Rebar', summary.slab?.rebar],['Type', summary.slab?.type],['Grade', summary.grade_concrete]] },
            ].map(({ title, color, specs }) => (
              <div key={title} className={`card border-l-4 ${color}`}>
                <h3 className="font-display font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <dl className="space-y-1.5">
                  {specs.map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
                      <dd className="font-semibold text-gray-800 dark:text-gray-200">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <div className="card grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Grid Spacing', `${summary.grid_spacing_mm?.x ?? 7200} × ${summary.grid_spacing_mm?.y ?? 7200} mm`],
              ['Seismic Zone', summary.seismic_zone],
              ['Wind Zone', summary.wind_zone],
              ['Foundation', summary.foundation?.split('–')[0] ?? 'Raft – 800mm'],
            ].map(([k,v]) => (
              <div key={k} className="text-center">
                <div className="font-bold text-gray-900 dark:text-white text-sm">{v}</div>
                <div className="text-xs text-gray-400 mt-0.5">{k}</div>
              </div>
            ))}
          </div>

          <div className="card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Rebar Detailing – Ground Floor Column</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Longitudinal Reinforcement</div>
                <ul className="text-gray-500 dark:text-gray-400 space-y-1 text-xs">
                  <li>• 8 bars of T25 (25mm dia.) – Fe500</li>
                  <li>• Arranged in 4-corner + 4-midface pattern</li>
                  <li>• Clear cover: 40mm to ties</li>
                  <li>• Lap length: 45× bar dia. = 1,125mm</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Transverse Reinforcement</div>
                <ul className="text-gray-500 dark:text-gray-400 space-y-1 text-xs">
                  <li>• T10 lateral ties @ 200mm c/c</li>
                  <li>• Confining ties @ 100mm near joints</li>
                  <li>• Ductile detailing per IS 13920</li>
                  <li>• Hook angle: 135° per seismic code</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* RC Frame Plan */}
      {activeTab === 'plan' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Typical Floor RC Frame Plan</h3>
            <p className="text-xs text-gray-400">Grid: 7200 × 7200 mm · 🟩 Columns · 🟨 Beams · - - Courtyard</p>
          </div>
          <RCFramePlan columns={columns} beams={beams} />
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded" /> Column (500×500)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-400 rounded" /> Beam (300×600)</div>
            <div className="flex items-center gap-1.5"><div className="w-5 h-3 border-2 border-dashed border-green-500 rounded" /> Courtyard Void</div>
          </div>
        </motion.div>
      )}

      {/* Element Schedule */}
      {activeTab === 'schedule' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-x-auto">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Column Schedule – Ground Floor (first 20)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {['Element ID','Type','Size (mm)','Material','Load (kN)','Rebar Spec','Grid'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(columns ?? []).slice(0, 20).map((el, i) => (
                <tr key={el.id} className={`border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                  <td className="py-2 px-3 font-mono text-xs text-brand-green">{el.element_id}</td>
                  <td className="py-2 px-3"><span className="badge badge-green">{el.element_type}</span></td>
                  <td className="py-2 px-3 font-mono text-xs">{el.size_mm}</td>
                  <td className="py-2 px-3 text-xs text-gray-500 dark:text-gray-400">{el.material}</td>
                  <td className="py-2 px-3 font-mono text-xs">{el.load_kn}</td>
                  <td className="py-2 px-3 text-xs text-gray-500 dark:text-gray-400">{el.rebar_spec}</td>
                  <td className="py-2 px-3 font-mono text-xs">{el.grid_x}-{el.grid_y}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
