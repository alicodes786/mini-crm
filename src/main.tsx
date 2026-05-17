import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppRoutes } from './routes/AppRoutes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
