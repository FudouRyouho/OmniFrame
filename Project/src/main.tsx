import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './providers/Theme/theme-context.tsx'
import { MenuProvider } from './providers/Menu/menu-context.tsx'
import { DataStateProvider } from './providers/DataState/data-state-context.tsx'
import { LoadoutProvider } from './providers/Loadout/loadout-context.tsx'
import { ShellProvider } from './providers/Shell/shell-context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataStateProvider>
        <LoadoutProvider>
          <MenuProvider>
            <ShellProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </ShellProvider>
          </MenuProvider>
        </LoadoutProvider>
      </DataStateProvider>
    </BrowserRouter>
  </StrictMode>,
)
