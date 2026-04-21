import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1f2e',
              color: '#e2e8f0',
              border: '1px solid #2d3748',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#00d4aa', secondary: '#0a0d14' } },
            error:   { iconTheme: { primary: '#f56565', secondary: '#0a0d14' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
