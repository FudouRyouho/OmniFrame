import { createContext } from "react";

export type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  themeColor: string;
  changeThemeColor: (color: string) => void;
  buttonStyle: string;
  changeButtonStyle: (typeButton: string) => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const themeColors = [
  "orokin",
  "grineer",
  "corpus",
  "infested",
  "sentient",
  "narmer",
  "scaldra",
  "techrot",
  "fortuna"
];
