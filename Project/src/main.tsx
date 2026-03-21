import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './providers/Theme/theme-context.tsx'
import { MenuProvider } from './providers/Menu/menu-context.tsx'
import { DataStateProvider } from './providers/DataState/data-state-context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataStateProvider>
        <MenuProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </MenuProvider>
      </DataStateProvider>
    </BrowserRouter>
  </StrictMode>,
)
