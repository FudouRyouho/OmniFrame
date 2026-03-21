import React, { type ReactNode, useState, useEffect, useContext } from "react";
import { ThemeContext, themeColors } from "./theme-base";

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          return savedTheme === "dark";
        }
      } catch (e) {
        console.debug("ThemeProvider: fail reading 'theme' from localStorage", e);
      }

      try {
        return (
          document.documentElement.classList.contains("dark") ||
          window.matchMedia("(prefers-color-scheme: dark)").matches
        );
      } catch (e) {
        console.debug("ThemeProvider: fail detecting dark mode", e);
      }
    }
    return true; // Default to dark for Warframe aesthetic
  });

  const [themeColor, setThemeColor] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("themeColor") || "orokin";
      } catch (e) {
        console.debug("ThemeProvider: fail reading 'themeColor'", e);
      }
    }
    return "orokin";
  });

  const [buttonStyle, setButtonStyle] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("buttonStyle") || "flat";
      } catch (e) {
        console.debug("ThemeProvider: fail reading 'buttonStyle'", e);
      }
    }
    return "flat";
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const changeThemeColor = (color: string) => {
    setThemeColor(color);
    try {
      if (typeof window !== "undefined")
        localStorage.setItem("themeColor", color);
    } catch (e) {
      console.debug("ThemeProvider: fail saving 'themeColor'", e);
    }
  };

  const changeButtonStyle = (typeButton: string) => {
    setButtonStyle(typeButton);
    try {
      if (typeof window !== "undefined")
        localStorage.setItem("buttonStyle", typeButton);
    } catch (e) {
      console.debug("ThemeProvider: fail saving 'buttonStyle'", e);
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    try {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        if (typeof window !== "undefined") localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        if (typeof window !== "undefined") localStorage.setItem("theme", "light");
      }
    } catch (e) {
      console.debug("ThemeProvider: fail applying theme class", e);
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    try {
      // Remove all theme classes first
      themeColors.forEach((c) => {
        document.documentElement.classList.remove(`theme-${c}`);
      });

      // Add actual theme class
      document.documentElement.classList.add(`theme-${themeColor}`);
    } catch (e) {
      console.debug("ThemeProvider: fail applying 'themeColor'", e);
    }
  }, [themeColor]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        themeColor,
        changeThemeColor,
        buttonStyle,
        changeButtonStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
