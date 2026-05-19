import { useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Palette, X } from "lucide-react";
import { themeColors } from "./theme-base";
import { colorMap } from "./theme-colors";
import { useTheme } from "./theme-context";

const ThemeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { themeColor, changeThemeColor } = useTheme();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/5 transition-all group"
        title="Personalizar Interfaz"
      >
        <Palette className="w-4 h-4 text-ui-primary" />
        <span className="text-sm leading-normal tracking-normal font-medium text-white/70 group-hover:text-white">
          Apariencia
        </span>
      </button>

      <Transition show={isOpen}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-[70vw] max-w-2xl h-[80vh] flex flex-col border border-ui-primary/30 bg-ui-bg p-6 rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
                <div className="flex justify-between items-center border-b border-ui-primary/10 pb-4 shrink-0">
                  <DialogTitle className="text-lg font-bold text-ui-primary flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Personalizar
                  </DialogTitle>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 py-4 space-y-4">
                  <h3 className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] sticky top-0 bg-ui-bg py-2 z-10">
                    Paletas
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {themeColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          changeThemeColor(color);
                          setIsOpen(false);
                        }}
                        className={`group flex items-center gap-4 p-3 rounded-lg border transition-all ${
                          themeColor === color
                            ? "border-ui-primary bg-ui-primary/5"
                            : "border-white/5 hover:border-ui-primary/20 hover:bg-white/5"
                        }`}
                      >
                        {/* Preview Box */}
                        <div className="flex shrink-0 w-16 h-10 rounded-md border border-white/10 overflow-hidden shadow-inner bg-black/20">
                          <div
                            className="w-1/4 h-full"
                            style={{ backgroundColor: colorMap[color]?.bg }}
                            title="Fondo"
                          />
                          <div
                            className="w-1/4 h-full"
                            style={{
                              backgroundColor: colorMap[color]?.primary,
                            }}
                            title="Primario"
                          />
                          <div
                            className="w-1/4 h-full"
                            style={{
                              backgroundColor: colorMap[color]?.secondary,
                            }}
                            title="Secundario"
                          />
                          <div
                            className="w-1/4 h-full"
                            style={{ backgroundColor: colorMap[color]?.accent }}
                            title="Acento"
                          />
                        </div>

                        <div className="text-left flex-1">
                          <p
                            className={`text-sm font-bold capitalize tracking-wide ${
                              themeColor === color
                                ? "text-ui-primary"
                                : "text-white/80"
                            }`}
                          >
                            {color}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[9px] uppercase font-bold opacity-30">
                              Warframe Palette
                            </span>
                          </div>
                        </div>

                        {themeColor === color && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-ui-primary/20 border border-ui-primary/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-ui-primary animate-pulse" />
                            <span className="text-[9px] font-bold text-ui-primary uppercase">
                              Activo
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-ui-primary/10">
                  <p className="text-[10px] text-center opacity-30 italic">
                    Las paletas cambian variables semánticas en tiempo real.
                  </p>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ThemeSelector;
