import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Eye, EyeOff, Sliders, RotateCcw } from 'lucide-react'
import BuildingModel3D from '../components/building/BuildingModel3D'
import useBuildingStore from '../store/buildingStore'

const ALL_FLOORS = [
  { code: 'B1', label: 'B1', type: 'basement',    color: 'bg-gray-500' },
  { code: 'G',  label: 'G',  type: 'commercial',  color: 'bg-amber-500' },
  { code: '1F', label: '1F', type: 'commercial',  color: 'bg-amber-400' },
  { code: '2F', label: '2F', type: 'residential', color: 'bg-green-500' },
  { code: '3F', label: '3F', type: 'terrace',     color: 'bg-teal-500' },
  { code: '4F', label: '4F', type: 'residential', color: 'bg-green-500' },
  { code: '5F', label: '5F', type: 'residential', color: 'bg-green-500' },
  { code: '6F', label: '6F', type: 'terrace',     color: 'bg-teal-500' },
  { code: '7F', label: '7F', type: 'residential', color: 'bg-green-500' },
  { code: '8F', label: '8F', type: 'residential', color: 'bg-green-500' },
  { code: '9F', label: '9F', type: 'terrace',     color: 'bg-sky-500' },
]

const FLOOR_INFO = {
  'B1': { title: 'Basement – Level B1', desc: 'Car parking (40 bays) + 8 EV charging stations. Raft foundation. Access via ramp from street.', specs: ['Area: 3,200 m²','Height: 3,200 mm','40 Parking Bays','8 EV Stations (Solar)'] },
  'G':  { title: 'Ground Floor', desc: 'Active commercial frontage: Market hall, specialty café, retail shops, and services.', specs: ['Area: 2,800 m²','Height: 5,000 mm','8 Commercial Units','Central Courtyard Entry'] },
  '1F': { title: '1st Floor Commercial', desc: 'Community hall, co-working hub, fitness studio, and mezzanine café overlook courtyard.', specs: ['Area: 2,600 m²','Height: 4,500 mm','6 Commercial Units','Events + Co-Work'] },
  '3F': { title: '3rd Floor + Sky Terrace', desc: 'Residential units with first sky terrace deck — planted garden for 3F–5F residents.', specs: ['Area: 2,400 m²','8 Residential Units','Sky Terrace: 200 m²','Green Deck + Seating'] },
  '6F': { title: '6th Floor + Sky Terrace', desc: 'Mid-level residential units and second sky terrace. Fire refuge zone.', specs: ['Area: 2,400 m²','8 Residential Units','Sky Terrace: 200 m²','Fire Refuge + Pergola'] },
  '9F': { title: '9th Floor + Rooftop Terrace', desc: 'Top residential floor and signature rooftop sky terrace. Solar array above.', specs: ['Area: 2,400 m²','8 Residential Units','Sky Terrace: 250 m²','Solar Array: 48 kWp'] },
}
const DEFAULT_INFO = { title: 'Residential Floor', desc: 'Efficient unit mix with balconies, courtyard views, and cross-ventilation. Every unit receives natural light.', specs: ['Area: 2,400 m²','Height: 3,500 mm','9 Residential Units','1BHK + 2BHK + Studio'] }

const LAYERS = [
  { key: 'structure', label: 'Structure' },
  { key: 'greenSpine', label: 'Green Spine' },
  { key: 'facade', label: 'Facade' },
  { key: 'courtyard', label: 'Courtyard' },
]

export default function BuildingExplorer() {
  const { layers, toggleLayer, louverAngle, setLouverAngle } = useBuildingStore()
  const [activeFloor, setActiveFloor] = useState('ALL')
  const info = FLOOR_INFO[activeFloor] ?? DEFAULT_INFO

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left sidebar – Floor selector */}
      <div className="w-24 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col items-center py-4 gap-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Floors</div>

        {/* Show all */}
        <button
          onClick={() => setActiveFloor('ALL')}
          className={`floor-btn mb-2 w-14 text-[10px] ${activeFloor === 'ALL' ? 'floor-btn-active' : 'floor-btn-inactive'}`}
        >
          ALL
        </button>

        {/* Individual floors – top to bottom (9F first) */}
        {[...ALL_FLOORS].reverse().map((fl) => (
          <button
            key={fl.code}
            onClick={() => setActiveFloor(activeFloor === fl.code ? 'ALL' : fl.code)}
            className={`floor-btn ${activeFloor === fl.code ? 'floor-btn-active' : 'floor-btn-inactive'}`}
            title={fl.type}
          >
            {fl.label}
          </button>
        ))}
      </div>

      {/* 3D Canvas area */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950">
        <BuildingModel3D activeFloor={activeFloor} onFloorClick={setActiveFloor} />

        {/* Floor info panel (bottom-left overlay) */}
        <AnimatePresence>
          {activeFloor !== 'ALL' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute bottom-6 left-6 glass rounded-2xl p-4 max-w-xs shadow-xl"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-display font-bold text-gray-900 dark:text-white text-sm">{info.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{info.desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-3">
                {info.specs.map(s => (
                  <div key={s} className="text-[11px] text-brand-green font-medium bg-green-50 dark:bg-green-900/20 rounded-md px-2 py-0.5">
                    {s}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right sidebar – Controls */}
      <div className="w-60 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
        {/* Layer toggles */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={15} className="text-brand-green" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Layers</span>
          </div>
          {LAYERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-1"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
              {layers[key]
                ? <Eye size={14} className="text-brand-green" />
                : <EyeOff size={14} className="text-gray-400" />
              }
            </button>
          ))}
        </div>

        {/* Louver angle */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sliders size={15} className="text-brand-amber" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Louver Angle</span>
          </div>
          <div className="text-3xl font-display font-bold text-brand-amber mb-2">{louverAngle}°</div>
          <input
            type="range" min={0} max={90} step={5} value={louverAngle}
            onChange={(e) => setLouverAngle(Number(e.target.value))}
            className="w-full accent-brand-amber"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0° Open</span><span>90° Closed</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Heat gain reduction: <span className="text-brand-green font-semibold">{Math.round(louverAngle / 90 * 70)}%</span>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => { setActiveFloor('ALL'); setLouverAngle(45) }}
          className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} /> Reset View
        </button>
      </div>
    </div>
  )
}
