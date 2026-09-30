import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, Play, X, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchRenders, fetchWalkthrough } from '../utils/api'

const PLACEHOLDER_RENDERS = [
  { id: 1, title: 'Aerial View', caption: "Bird's-eye view of the complete B+G+9 development", url: null, tag: 'Exterior' },
  { id: 2, title: 'Courtyard View', caption: 'Central landscaped courtyard with Venturi void and green spine', url: null, tag: 'Courtyard' },
  { id: 3, title: 'East Facade', caption: 'Kinetic louver facade on east elevation — mid-afternoon light', url: null, tag: 'Facade' },
  { id: 4, title: 'Ground Activation', caption: 'Market hall and café at ground level — evening scene', url: null, tag: 'Commercial' },
  { id: 5, title: 'Residential Interior', caption: 'Typical 2BHK with balcony and courtyard view', url: null, tag: 'Interior' },
  { id: 6, title: 'Sky Terrace 6F', caption: '6th floor sky terrace — shared green deck and pergola', url: null, tag: 'Terrace' },
]

const TAG_COLORS = {
  Exterior: 'badge-sky',
  Courtyard: 'badge-green',
  Facade: 'badge-amber',
  Commercial: 'badge-amber',
  Interior: 'badge-purple',
  Terrace: 'badge-green',
}

// Placeholder render card
function RenderCard({ render, onClick }) {
  return (
    <motion.div
      className="card-hover cursor-pointer group"
      onClick={() => onClick(render)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image placeholder */}
      <div className="w-full h-48 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex flex-col items-center justify-center mb-3 overflow-hidden group-hover:from-green-100 group-hover:to-teal-100 dark:group-hover:from-green-900/30 dark:group-hover:to-teal-900/30 transition-all duration-300">
        <Image size={32} className="text-gray-400 dark:text-gray-500 mb-2 group-hover:text-brand-green transition-colors" />
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{render.title}</span>
        <span className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">Add render image in /static/renders/</span>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{render.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{render.caption}</p>
        </div>
        <span className={`badge ${TAG_COLORS[render.tag] ?? 'badge-sky'} flex-shrink-0`}>{render.tag}</span>
      </div>
    </motion.div>
  )
}

// Lightbox modal
function Lightbox({ render, onClose, onPrev, onNext, hasPrev, hasNext }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2" onClick={onClose}>
        <X size={24} />
      </button>
      {hasPrev && (
        <button className="absolute left-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10" onClick={(e) => { e.stopPropagation(); onPrev() }}>
          <ChevronLeft size={28} />
        </button>
      )}
      {hasNext && (
        <button className="absolute right-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10" onClick={(e) => { e.stopPropagation(); onNext() }}>
          <ChevronRight size={28} />
        </button>
      )}
      <motion.div
        className="max-w-3xl w-full mx-8"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mb-4">
          {render.url ? (
            <img src={render.url} alt={render.title} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <div className="text-center">
              <Image size={48} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Render image not available yet</p>
              <p className="text-gray-600 text-xs mt-1">Add to backend/static/renders/</p>
            </div>
          )}
        </div>
        <h2 className="text-white font-display font-bold text-xl">{render.title}</h2>
        <p className="text-gray-400 mt-1">{render.caption}</p>
      </motion.div>
    </motion.div>
  )
}

export default function GalleryPage() {
  const [selected, setSelected] = useState(null)
  const [filterTag, setFilterTag] = useState('All')
  const { data: renders } = useQuery({ queryKey: ['renders'], queryFn: fetchRenders, retry: 1 })
  const { data: walkthrough } = useQuery({ queryKey: ['walkthrough'], queryFn: fetchWalkthrough, retry: 1 })

  // Merge API renders with placeholders
  const displayRenders = renders?.length > 0
    ? renders.map(r => ({ ...r, tag: 'Exterior' }))
    : PLACEHOLDER_RENDERS

  const tags = ['All', ...new Set(displayRenders.map(r => r.tag))]
  const filtered = filterTag === 'All' ? displayRenders : displayRenders.filter(r => r.tag === filterTag)

  const selectedIdx = selected ? filtered.findIndex(r => r.id === selected.id) : -1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="section-title">Gallery & Walkthrough</h1>
        <p className="section-subtitle">Rendered views, facade studies, and 30-second walkthrough animation</p>
      </div>

      {/* Walkthrough video section */}
      <div className="card mb-8 bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-full md:w-64 h-40 bg-black/40 rounded-xl flex items-center justify-center border border-gray-700">
            {walkthrough?.url ? (
              <video src={walkthrough.url} controls className="w-full h-full rounded-xl object-cover" />
            ) : (
              <div className="text-center">
                <Play size={40} className="text-brand-green mx-auto mb-2" />
                <p className="text-gray-400 text-xs">Add walkthrough.mp4 to</p>
                <p className="text-gray-500 text-xs">backend/static/video/</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-display font-bold text-xl mb-2">30-Second Walkthrough</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Animated walkthrough of the full ECO-PULSE building — basement parking, ground commercial activation,
              residential units, sky terraces, and rooftop solar array.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Basement → Roof Journey', 'Courtyard Experience', 'Facade Animation', 'Sky Terrace Views'].map(t => (
                <span key={t} className="badge-green">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter tags */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterTag === tag
                ? 'bg-brand-green text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Renders grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((render, i) => (
          <motion.div
            key={render.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <RenderCard render={render} onClick={setSelected} />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <Lightbox
            render={selected}
            onClose={() => setSelected(null)}
            hasPrev={selectedIdx > 0}
            hasNext={selectedIdx < filtered.length - 1}
            onPrev={() => setSelected(filtered[selectedIdx - 1])}
            onNext={() => setSelected(filtered[selectedIdx + 1])}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
