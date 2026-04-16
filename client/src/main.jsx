// client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { AlertProvider } from './contexts/AlertContext.jsx'
import { SocketProvider } from './contexts/SocketContext'
import './assets/styles/index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { HelmetProvider } from 'react-helmet-async'
import { registerServiceWorker } from './utils/sw-register.js'

registerServiceWorker(); // Register the service worker

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // Data stays fresh for 5 minutes
      gcTime: 30 * 60 * 1000,           // Keep cache for 30 minutes
      refetchOnWindowFocus: false,       // Don't refetch when tab gains focus
      refetchOnMount: 'always',          // Always check freshness on mount (serves cache instantly if fresh)
      refetchOnReconnect: true,          // Refetch when internet comes back
      retry: 1,                          // Retry failed requests once
      networkMode: 'offlineFirst',       // Serve cache immediately, refetch in background
    },
  },
})

// Persist query cache to localStorage — data shows instantly on page load,
// then TanStack Query silently refetches in background if stale
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'nxthire-query-cache',
  // Only persist successful queries, skip errors
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister,
              maxAge: 30 * 60 * 1000,       // Cache persists for 30 minutes max
              buster: 'v1',                  // Change this to bust old caches on deploy
              dehydrateOptions: {
                shouldDehydrateQuery: (query) => {
                  // Only persist successful queries (not errors or loading)
                  return query.state.status === 'success'
                },
              },
            }}
          >
            <Router>
              <AlertProvider>
                <AuthProvider>
                  <SocketProvider>
                    <App />
                    <ToastContainer position="top-right" autoClose={2000} />
                  </SocketProvider>
                </AuthProvider>
              </AlertProvider>
            </Router>
          </PersistQueryClientProvider>
        </GoogleOAuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
