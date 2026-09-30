import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2, Car, Leaf, Zap, Users, Layers, Sun, Wind } from 'lucide-react'
import { fetchOverview, fetchFloors } from '../utils/api'
import useBuildingStore from '../store/buildingStore'

const STAT_COLORS = {
  green:  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  amber:  'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  sky:    'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  teal:   'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  red:    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

function StatCard({ icon: Icon, label, value, unit, color = 'green', delay = 0 }) {
  return (
    <motion.div
      className="card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${STAT_COLORS[color]}`}>
        <Icon size={20} />
      </div>
      <div className="metric-value">{value}</div>
      {unit && <div className="text-xs text-gray-400 dark:text-gray-500">{unit}</div>}
      <div className="metric-label mt-0.5">{label}</div>
    </motion.div>
  )
}

const FEATURES = [
  {
    title: 'Venturi Courtyard',
    desc: 'Physics-driven wind acceleration through a central 24m–12m tapering void, creating natural Venturi effect for passive ventilation.',
    icon: Wind, color: 'sky',
  },
  {
    title: 'Kinetic Facade Louvers',
    desc: 'East/West louvers pivot 0°–90° following the sun path, reducing solar heat gain by ~35% on peak summer days.',
    icon: Sun, color: 'amber',
  },
  {
    title: 'Continuous Green Spine',
    desc: 'Integrated planter beams and living walls run from B1 to 9F on every floor, connecting nature through the full building height.',
    icon: Leaf, color: 'green',
  },
  {
    title: 'EV–Solar Loop',
    desc: 'Rooftop solar panels (48 kWh peak) power 8 basement EV charging stations, creating a closed renewable energy loop.',
    icon: Zap, color: 'amber',
  },
  {
    title: 'Sky Terraces',
    desc: 'Shared green decks at 3F, 6F, and 9F serve as social gathering spaces and fire refuge zones every three floors.',
    icon: Layers, color: 'teal',
  },
  {
    title: 'Residential Efficiency',
    desc: '72 units (2F–9F), every unit has daylight, ventilation, and courtyard views. Mix of 1BHK, 2BHK, and Studio types.',
    icon: Users, color: 'purple',
  },
]

export default function HomePage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: fetchOverview,
    retry: 1,
  })
  const { data: floors } = useQuery({ queryKey: ['floors'], queryFn: fetchFloors, retry: 1 })

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white py-24 px-4">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-brand-teal/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'1.5s'}} />
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-brand-amber/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'3s'}} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6"
          >
            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            Urban Mixed-Use Design Challenge · B+G+9
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            ECO<span className="gradient-text">-PULSE</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            A nature-integrated, climate-responsive mixed-use development with active commercial
            spaces and sustainable residential living, centered around a landscaped Venturi courtyard.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-2 justify-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {['Basement Parking','Ground + 1F Commercial','2F–9F Residential','Sky Terraces at 3F/6F/9F','Kinetic Louver Facade','Venturi Courtyard'].map(tag => (
              <span key={tag} className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm text-gray-300">
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 mb-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-28 animate-pulse bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Layers} label="Total Floors" value="B+G+9" unit="11 levels" color="purple" delay={0} />
            <StatCard icon={Users} label="Residential Units" value={overview?.total_units ?? 72} unit="units" color="green" delay={0.05} />
            <StatCard icon={Car} label="Parking Bays" value={overview?.parking_bays ?? 40} unit="bays" color="sky" delay={0.1} />
            <StatCard icon={Zap} label="EV Chargers" value={overview?.ev_bays ?? 8} unit="solar-powered" color="amber" delay={0.15} />
            <StatCard icon={Leaf} label="Green Coverage" value={`${Math.round((overview?.green_coverage_sqm ?? 1150) / 1000 * 10) / 10}k`} unit="m² total" color="green" delay={0.2} />
            <StatCard icon={Building2} label="Total Built Area" value={`${Math.round((overview?.total_area_sqm ?? 27400) / 1000)}k`} unit="m²" color="teal" delay={0.25} />
          </div>
        )}
      </section>

      {/* Floor breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <h2 className="section-title mb-1">Building Programme</h2>
        <p className="section-subtitle mb-6">Floor-by-floor use breakdown — B1 to 9th Floor</p>

        <div className="flex gap-1 overflow-x-auto pb-2">
          {(floors ?? []).map((floor, i) => {
            const colorMap = {
              'Basement': 'bg-gray-500',
              'Commercial': 'bg-amber-500',
              'Residential': 'bg-brand-green',
              'Residential+Terrace': 'bg-teal-500',
            }
            const barColor = colorMap[floor.use_type] ?? 'bg-gray-400'
            const barH = Math.round(floor.area_sqm / 35)
            return (
              <motion.div
                key={floor.level_code}
                className="flex flex-col items-center gap-1 min-w-[52px]"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: i * 0.06, duration: 0.3, origin: 'bottom' }}
              >
                <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  {Math.round(floor.area_sqm)}m²
                </div>
                <div
                  className={`w-10 rounded-t-md ${barColor} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                  style={{ height: `${barH}px` }}
                  title={`${floor.level_code}: ${floor.description}`}
                />
                <div className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{floor.level_code}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {[
            { label: 'Basement', color: 'bg-gray-500' },
            { label: 'Commercial', color: 'bg-amber-500' },
            { label: 'Residential', color: 'bg-brand-green' },
            { label: 'Sky Terrace', color: 'bg-teal-500' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <div className={`w-3 h-3 rounded-sm ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Innovation Features grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <h2 className="section-title mb-1">Innovation & Technical Uniqueness</h2>
        <p className="section-subtitle mb-6">Six defining features that make ECO-PULSE climate-responsive and future-ready</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ title, desc, icon: Icon, color }, i) => (
            <motion.div
              key={title}
              className="card-hover"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${STAT_COLORS[color]}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Structural specs banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white py-10 px-4 mb-0">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider font-medium">Structural System</p>
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
            RC Frame · M30/Fe500 · IS 456 / IS 1893
          </h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              ['Columns', '500×500 mm', 'M30 RC · 8-T25 bars'],
              ['Beams', '300×600 mm', 'M30 RC · T8@150 stirrups'],
              ['Slab', '150 mm', 'Two-way · T10@200 BW'],
              ['Foundation', 'Raft · 800mm', 'M35 concrete'],
              ['Grid', '7200×7200 mm', 'Seismic Zone III'],
            ].map(([name, size, spec]) => (
              <div key={name} className="text-center">
                <div className="text-brand-green font-bold text-base">{size}</div>
                <div className="text-gray-200 font-medium">{name}</div>
                <div className="text-gray-400 text-xs">{spec}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
