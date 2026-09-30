import { useEffect, useRef } from 'react'
import useBuildingStore from '../store/buildingStore'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/realtime'

export function useRealtimeMetrics() {
  const setLiveMetrics = useBuildingStore(s => s.setLiveMetrics)
  const wsRef = useRef(null)

  useEffect(() => {
    const connect = () => {
      try {
        wsRef.current = new WebSocket(WS_URL)
        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setLiveMetrics(data)
          } catch (_) {}
        }
        wsRef.current.onclose = () => {
          // Auto-reconnect after 3s
          setTimeout(connect, 3000)
        }
        wsRef.current.onerror = () => {
          wsRef.current?.close()
        }
      } catch (_) {
        setTimeout(connect, 5000)
      }
    }
    connect()
    return () => wsRef.current?.close()
  }, [setLiveMetrics])
}
