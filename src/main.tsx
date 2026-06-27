import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RoleProvider } from './context/RoleContext.tsx'
import { LocationProvider } from './context/LocationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocationProvider>
      <RoleProvider>
        <App />
      </RoleProvider>
    </LocationProvider>
  </StrictMode>,
)
