import React, { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import { ThemeProvider, createTheme, responsiveFontSizes, type PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'dark',
});

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme({
          palette: {
            mode,
            ...(mode === 'light'
              ? {
                  primary: { main: '#1A237E', light: '#534BAE', dark: '#000051' },
                  secondary: { main: '#00B0FF' },
                  background: { default: '#F5F7FA', paper: '#FFFFFF' },
                  text: { primary: '#1C1C1C', secondary: '#4A4A4A' },
                }
              : {
                  primary: { main: '#3366FF', light: '#5C7CFF', dark: '#1939B7' },
                  secondary: { main: '#40C4FF' },
                  background: { 
                    default: '#0B0F19', 
                    paper: '#111927' 
                  },
                  text: { primary: '#FFFFFF', secondary: '#9CA3AF' },
                }),
          },
          spacing: 8, // base 8px, but we'll use rem in sx
          shape: { borderRadius: '0.5rem' },
          typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            htmlFontSize: 16,
            h1: { fontSize: '2.25rem', fontWeight: 700 },
            h2: { fontSize: '1.75rem', fontWeight: 700 },
            h3: { fontSize: '1.5rem', fontWeight: 600 },
            h4: { fontSize: '1.25rem', fontWeight: 600 },
            h5: { fontSize: '1.1rem', fontWeight: 500 },
            h6: { fontSize: '0.95rem', fontWeight: 500 },
            body1: { fontSize: '0.9rem' },
            body2: { fontSize: '0.8rem' },
            button: { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' },
          },
          components: {
            MuiButton: {
              styleOverrides: {
                root: {
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                },
              },
            },
            MuiCard: {
              styleOverrides: {
                root: {
                  borderRadius: '0.5rem',
                  backgroundImage: 'none',
                  boxShadow: mode === 'light' 
                    ? '0px 2px 12px rgba(0, 0, 0, 0.04)' 
                    : '0px 4px 20px rgba(0, 0, 0, 0.3)',
                },
              },
            },
            MuiPaper: {
              styleOverrides: {
                root: {
                  borderRadius: '0.5rem',
                  backgroundImage: 'none',
                  boxShadow: mode === 'light' 
                    ? '0px 2px 12px rgba(0, 0, 0, 0.04)' 
                    : '0px 4px 20px rgba(0, 0, 0, 0.3)',
                },
              },
            },
          },
        })
      ),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
