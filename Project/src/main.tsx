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
