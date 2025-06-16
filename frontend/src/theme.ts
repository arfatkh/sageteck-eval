import { createTheme, alpha, Theme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    darkBg: {
      main: string;
      light: string;
      dark: string;
    };
  }
  interface PaletteOptions {
    darkBg: {
      main: string;
      light: string;
      dark: string;
    };
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    metric: React.CSSProperties;
    metricLarge: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    metric?: React.CSSProperties;
    metricLarge?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    metric: true;
    metricLarge: true;
  }
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1',
      light: '#818CF8',
      dark: '#4F46E5',
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#020617',
      paper: '#0F172A',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
    divider: alpha('#94A3B8', 0.08),
    darkBg: {
      main: '#111111',
      light: '#1a1a1a',
      dark: '#0a0a0a',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.015em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '-0.005em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.02em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    metric: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      fontFeatureSettings: '"tnum"',
      fontVariantNumeric: 'tabular-nums',
    },
    metricLarge: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      fontFeatureSettings: '"tnum"',
      fontVariantNumeric: 'tabular-nums',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 30px -6px rgba(0, 0, 0, 0.1), 0px 12px 12px -6px rgba(0, 0, 0, 0.04)',
    '0px 30px 35px -7px rgba(0, 0, 0, 0.1), 0px 14px 14px -7px rgba(0, 0, 0, 0.04)',
    '0px 35px 40px -8px rgba(0, 0, 0, 0.1), 0px 16px 16px -8px rgba(0, 0, 0, 0.04)',
    '0px 40px 45px -9px rgba(0, 0, 0, 0.1), 0px 18px 18px -9px rgba(0, 0, 0, 0.04)',
    '0px 45px 50px -10px rgba(0, 0, 0, 0.1), 0px 20px 20px -10px rgba(0, 0, 0, 0.04)',
    '0px 50px 55px -11px rgba(0, 0, 0, 0.1), 0px 22px 22px -11px rgba(0, 0, 0, 0.04)',
    '0px 55px 60px -12px rgba(0, 0, 0, 0.1), 0px 24px 24px -12px rgba(0, 0, 0, 0.04)',
    '0px 60px 65px -13px rgba(0, 0, 0, 0.1), 0px 26px 26px -13px rgba(0, 0, 0, 0.04)',
    '0px 65px 70px -14px rgba(0, 0, 0, 0.1), 0px 28px 28px -14px rgba(0, 0, 0, 0.04)',
    '0px 70px 75px -15px rgba(0, 0, 0, 0.1), 0px 30px 30px -15px rgba(0, 0, 0, 0.04)',
    '0px 75px 80px -16px rgba(0, 0, 0, 0.1), 0px 32px 32px -16px rgba(0, 0, 0, 0.04)',
    '0px 80px 85px -17px rgba(0, 0, 0, 0.1), 0px 34px 34px -17px rgba(0, 0, 0, 0.04)',
    '0px 85px 90px -18px rgba(0, 0, 0, 0.1), 0px 36px 36px -18px rgba(0, 0, 0, 0.04)',
    '0px 90px 95px -19px rgba(0, 0, 0, 0.1), 0px 38px 38px -19px rgba(0, 0, 0, 0.04)',
    '0px 95px 100px -20px rgba(0, 0, 0, 0.1), 0px 40px 40px -20px rgba(0, 0, 0, 0.04)',
    '0px 100px 105px -21px rgba(0, 0, 0, 0.1), 0px 42px 42px -21px rgba(0, 0, 0, 0.04)',
    '0px 105px 110px -22px rgba(0, 0, 0, 0.1), 0px 44px 44px -22px rgba(0, 0, 0, 0.04)',
    '0px 110px 115px -23px rgba(0, 0, 0, 0.1), 0px 46px 46px -23px rgba(0, 0, 0, 0.04)',
    '0px 115px 120px -24px rgba(0, 0, 0, 0.1), 0px 48px 48px -24px rgba(0, 0, 0, 0.04)',
  ] as Theme['shadows'],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0F172A',
          border: '1px solid',
          borderColor: alpha('#94A3B8', 0.08),
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
          borderColor: alpha('#94A3B8', 0.08),
          backgroundImage: 'none',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: alpha('#94A3B8', 0.04),
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0F172A',
          border: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#020617',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: alpha('#94A3B8', 0.08),
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: alpha('#94A3B8', 0.04),
          },
          '&.Mui-selected': {
            backgroundColor: alpha('#6366F1', 0.15),
            '&:hover': {
              backgroundColor: alpha('#6366F1', 0.2),
            },
          },
        },
      },
    },
  },
}); 