import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three') || id.includes('@react-three')) return 'three-vendor'
              if (id.includes('recharts') || id.includes('d3')) return 'chart-vendor'
              if (id.includes('framer-motion')) return 'motion-vendor'
              if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor'
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      // Proxy only in development
      ...(isDev && {
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
          '/ws': {
            target: 'ws://localhost:8000',
            ws: true,
            changeOrigin: true,
          },
          '/static': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
        },
      }),
    },
  }
})
