import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

// Building
export const fetchOverview   = () => api.get('/api/building/overview').then(r => r.data)
export const fetchFloors     = () => api.get('/api/building/floors').then(r => r.data)
export const fetchFloor      = (code) => api.get(`/api/building/floors/${code}`).then(r => r.data)

// Floors
export const fetchBasement   = () => api.get('/api/floors/basement').then(r => r.data)
export const fetchCommercial = (level) => api.get(`/api/floors/commercial/${level}`).then(r => r.data)
export const fetchResidential= (level) => api.get(`/api/floors/residential/${level}`).then(r => r.data)

// Sustainability
export const fetchSolar      = (date, hour, louver) =>
  api.get('/api/sustainability/solar', { params: { date, hour, louver_angle: louver } }).then(r => r.data)
export const fetchSolarDay   = (date, louver) =>
  api.get('/api/sustainability/solar/day-profile', { params: { date, louver_angle: louver } }).then(r => r.data)
export const fetchWind       = () => api.get('/api/sustainability/wind').then(r => r.data)
export const fetchLouverImpact = () => api.get('/api/sustainability/louver-impact').then(r => r.data)
export const fetchGreenCoverage = () => api.get('/api/sustainability/green-coverage').then(r => r.data)

// Structural
export const fetchStructuralSummary = () => api.get('/api/structural/summary').then(r => r.data)
export const fetchColumns    = () => api.get('/api/structural/columns').then(r => r.data)
export const fetchBeams      = () => api.get('/api/structural/beams').then(r => r.data)

// Media
export const fetchRenders    = () => api.get('/api/media/renders').then(r => r.data)
export const fetchWalkthrough= () => api.get('/api/media/walkthrough').then(r => r.data)
