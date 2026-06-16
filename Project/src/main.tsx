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
import { StaticAdapter } from "./shared/data/adapters/StaticAdapter";

// Bootstrap del plano de datos del engine ANTES del primer render: sin esto, el motor
// corre contra repos vacíos y la salida C→D (useViewModel) llega vacía a la UI.
// Vía el puerto "0" con StaticAdapter inyectado (import estático, comportamiento previo
// detrás del seam). Slice 2 de la Fase 1 lo cambia a BrowserAdapter (fetch lazy) para
// sacar los datos del bundle (OQ-DATA-12). El render se difiere hasta que la carga resuelva.
loadEngineData(new StaticAdapter()).then(() => {
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
});
