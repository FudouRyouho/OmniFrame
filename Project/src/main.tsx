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
import { loadEngineData } from "./core/engine/bootstrap/engine-data.ts";
import { browserSource } from "./shared/data/adapters/BrowserAdapter";

// Bootstrap del plano de datos del engine ANTES del primer render: sin esto, el motor
// corre contra repos vacíos y la salida C→D (useViewModel) llega vacía a la UI.
// Vía el puerto "0" con la instancia compartida `browserSource` (fetch lazy desde /data/,
// cacheada): la MISMA que usa DataRegistry para display → cada archivo común se baja una
// sola vez (Slice 3). Los JSON ya NO viajan en el bundle (OQ-DATA-12). Render diferido.
loadEngineData(browserSource).then(() => {
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
