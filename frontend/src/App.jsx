import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/ui/Navbar'
import HomePage from './pages/HomePage'
import BuildingExplorer from './pages/BuildingExplorer'
import FloorPlanner from './pages/FloorPlanner'
import SustainabilityDash from './pages/SustainabilityDash'
import StructuralView from './pages/StructuralView'
import GalleryPage from './pages/GalleryPage'
import useBuildingStore from './store/buildingStore'
import { useRealtimeMetrics } from './hooks/useRealtimeMetrics'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function AppInner() {
  const initTheme = useBuildingStore(s => s.initTheme)
  useRealtimeMetrics()  // Connect WebSocket for live metrics

  useEffect(() => {
    initTheme()  // Apply stored dark/light on mount
  }, [initTheme])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <Navbar />
        <main>
          <Routes>
            <Route path="/"              element={<HomePage />} />
            <Route path="/explorer"      element={<BuildingExplorer />} />
            <Route path="/floors"        element={<FloorPlanner />} />
            <Route path="/sustainability"element={<SustainabilityDash />} />
            <Route path="/structural"    element={<StructuralView />} />
            <Route path="/gallery"       element={<GalleryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
