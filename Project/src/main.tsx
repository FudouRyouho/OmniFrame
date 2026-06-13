import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./providers/Theme/theme-context.tsx";
import { MenuProvider } from "./providers/Menu/menu-context.tsx";
import { DataStateProvider } from "./providers/DataState/data-state-context.tsx";
import { ShellProvider } from "./providers/Shell/shell-context.tsx";
import { EnsembleProvider } from "./providers/Ensemble/EnsembleProvider.tsx";
import { loadEngineData } from "./core/engine/fixtures/engine-data.ts";

// Bootstrap del plano de datos del engine: sin esto, el motor corre contra repos
// vacíos en runtime y la salida C→D (useViewModel) llega vacía a la UI.
// Provisional (OQ-DATA-9 "mecanismo de carga"): reúsa el loader por import estático
// de fixtures/; el fetch lazy y la reubicación fuera de fixtures/ están diferidos.
loadEngineData();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <DataStateProvider>
        <EnsembleProvider>
          <MenuProvider>
            <ShellProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </ShellProvider>
          </MenuProvider>
        </EnsembleProvider>
      </DataStateProvider>
    </BrowserRouter>
  </StrictMode>,
);
