//src/components/ui/theme-provider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  resolvedMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme-mode", mode);
    }
  }, [mode, mounted]);

  const resolvedMode = React.useMemo(() => {
    if (mode === "system") {
      return typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return mode;
  }, [mode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedMode,
          primary: {
            main: resolvedMode === "dark" ? "#60a5fa" : "#225dcd",
            light: resolvedMode === "dark" ? "#93c5fd" : "#5a85d9",
            dark: resolvedMode === "dark" ? "#3b82f6" : "#1a4aa0",
            contrastText: "#ffffff",
          },
          secondary: {
            main: resolvedMode === "dark" ? "#4dd0c2" : "#14b8a6",
            light: resolvedMode === "dark" ? "#7dd3d8" : "#4dd0c2",
            dark: resolvedMode === "dark" ? "#14b8a6" : "#0f8a7c",
            contrastText: "#ffffff",
          },
          background: {
            default: resolvedMode === "dark" ? "#0f172a" : "#f8fafc",
            paper: resolvedMode === "dark" ? "#1e293b" : "#ffffff",
          },
          text: {
            primary: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
            secondary: resolvedMode === "dark" ? "#94a3b8" : "#64748b",
          },
          divider: resolvedMode === "dark" ? "#334155" : "#e2e8f0",
          action: {
            hover:
              resolvedMode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
            selected:
              resolvedMode === "dark"
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(0, 0, 0, 0.08)",
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
            fontSize: "2.5rem",
            lineHeight: 1.2,
            color: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
          },
          h2: {
            fontWeight: 600,
            fontSize: "2rem",
            lineHeight: 1.3,
            color: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
          },
          h3: {
            fontWeight: 600,
            fontSize: "1.5rem",
            lineHeight: 1.4,
            color: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
          },
          h4: {
            fontWeight: 600,
            fontSize: "1.25rem",
            lineHeight: 1.4,
            color: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
          },
          h5: {
            fontWeight: 500,
            fontSize: "1.125rem",
            lineHeight: 1.4,
            color: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
          },
          h6: {
            fontWeight: 500,
            fontSize: "1rem",
            lineHeight: 1.4,
            color: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
          },
          body1: {
            color: resolvedMode === "dark" ? "#e2e8f0" : "#475569",
          },
          body2: {
            color: resolvedMode === "dark" ? "#cbd5e1" : "#64748b",
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: 8,
                fontWeight: 500,
                padding: "8px 16px",
              },
              contained: {
                boxShadow: "none",
                "&:hover": {
                  boxShadow:
                    resolvedMode === "dark"
                      ? "0 4px 8px rgba(0, 0, 0, 0.3)"
                      : "0 4px 8px rgba(0, 0, 0, 0.12)",
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                backgroundColor:
                  resolvedMode === "dark" ? "#1e293b" : "#ffffff",
                boxShadow:
                  resolvedMode === "dark"
                    ? "0 1px 3px rgba(0, 0, 0, 0.3)"
                    : "0 1px 3px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  boxShadow:
                    resolvedMode === "dark"
                      ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                      : "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 8,
                  backgroundColor:
                    resolvedMode === "dark" ? "#334155" : "#ffffff",
                  "& fieldset": {
                    borderColor:
                      resolvedMode === "dark" ? "#475569" : "#d1d5db",
                  },
                  "&:hover fieldset": {
                    borderColor:
                      resolvedMode === "dark" ? "#64748b" : "#9ca3af",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor:
                      resolvedMode === "dark" ? "#60a5fa" : "#225dcd",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: resolvedMode === "dark" ? "#94a3b8" : "#64748b",
                },
                "& .MuiOutlinedInput-input": {
                  color: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                backgroundColor:
                  resolvedMode === "dark" ? "#1e293b" : "#ffffff",
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor:
                  resolvedMode === "dark" ? "#0f172a" : "#ffffff",
                color: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
                boxShadow:
                  resolvedMode === "dark"
                    ? "0 1px 3px rgba(0, 0, 0, 0.3)"
                    : "0 1px 3px rgba(0, 0, 0, 0.1)",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor:
                  resolvedMode === "dark" ? "#1e293b" : "#ffffff",
                color: resolvedMode === "dark" ? "#f1f5f9" : "#1e293b",
              },
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: {
                "&:hover": {
                  backgroundColor:
                    resolvedMode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.04)",
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                backgroundColor:
                  resolvedMode === "dark" ? "#334155" : "#f1f5f9",
                color: resolvedMode === "dark" ? "#e2e8f0" : "#475569",
              },
            },
          },
        },
      }),
    [resolvedMode]
  );

  const toggleMode = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  const contextValue = {
    mode,
    setMode,
    toggleMode,
    resolvedMode,
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}
