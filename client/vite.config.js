// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Raise the warning threshold; we already split via React.lazy and manualChunks.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Group big shared dependencies into their own chunks so the initial bundle
        // only contains what's needed to render the landing page.
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-query':    ['@tanstack/react-query', '@tanstack/react-query-persist-client', '@tanstack/query-sync-storage-persister'],
          'vendor-forms':    ['react-hook-form', 'react-select', 'react-datepicker'],
          'vendor-charts':   ['recharts'],
          'vendor-editor':   ['react-quill', 'dompurify'],
          'vendor-excel':    ['xlsx', 'file-saver'],
          'vendor-motion':   ['framer-motion'],
          'vendor-icons':    ['lucide-react'],
          'vendor-radix':    ['@radix-ui/react-select', '@radix-ui/react-tabs', '@headlessui/react'],
          'vendor-socket':   ['socket.io-client'],
        },
      },
    },
  },
})
