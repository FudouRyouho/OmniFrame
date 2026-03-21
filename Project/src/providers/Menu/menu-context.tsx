import React, { type ReactNode, useState, useEffect, useContext, createContext, useCallback, useRef } from "react";

type MenuContextType = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    registerDialog: () => void;
    unregisterDialog: () => void;
}

export const MenuContext = createContext<MenuContextType | null>(null);

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogCount = useRef(0);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const registerDialog = useCallback(() => { dialogCount.current++; }, []);
  const unregisterDialog = useCallback(() => { dialogCount.current = Math.max(0, dialogCount.current - 1); }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dialogCount.current === 0 && !isOpen) {
        open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isOpen]);

  return (
    <MenuContext.Provider value={{ isOpen, open, close, toggle, registerDialog, unregisterDialog }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
    const ctx = useContext(MenuContext);
    if (!ctx) throw new Error("useMenu must be used within MenuProvider");
    return ctx;
};