// // client/src/main.jsx
// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { BrowserRouter as Router } from 'react-router-dom'
// import App from './App.jsx'
// import { AuthProvider } from './contexts/AuthContext.jsx'
// import { AlertProvider } from './contexts/AlertContext.jsx'
// import './assets/styles/index.css'
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import { registerServiceWorker } from './utils/sw-register.js'

// registerServiceWorker(); // Register the service worker

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <Router>
//       <AlertProvider>
//         <AuthProvider>
//           <App />
//           <ToastContainer position="top-right" autoClose={5000} />
//         </AuthProvider>
//       </AlertProvider>
//     </Router>
//   </React.StrictMode>,
// )

// client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { AlertProvider } from './contexts/AlertContext.jsx'
import './assets/styles/index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { registerServiceWorker } from './utils/sw-register.js'

registerServiceWorker(); // Register the service worker

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000,         // Garbage collect after 10 minutes
      refetchOnWindowFocus: false,     // Don't refetch when tab gains focus
      retry: 1,                        // Retry failed requests once
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AlertProvider>
          <AuthProvider>
            <App />
            <ToastContainer position="top-right" autoClose={2000} />
          </AuthProvider>
        </AlertProvider>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
)
