import { createTheme } from '@mui/material/styles';
import ArrowDropDownRounded from '@mui/icons-material/ArrowDropDownRounded';

const primary = '#5B44F2';
const secondary = '#07D9C4';
const error = '#DC004E';
const warning = '#E265AB';
const disabled = '#808080';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: primary,
      contrastText: '#F2F2F2',
    },
    secondary: {
      main: secondary,
      contrastText: '#000',
    },
    error: {
      main: error,
      contrastText: '#fff',
    },
    warning: {
      main: warning,
    },
    background: {
      paper: '#202030',
      default: '#262840',
    },
    action: {
      disabledBackground: 'transparent',
      disabled: disabled,
    },
  },
  typography: {
    fontFamily: 'JetBrains Mono',
  },
  components: {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'unset' } },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiInputBase-root': { borderRadius: 10, color: 'secondary' } },
      },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: ArrowDropDownRounded,
      },
      styleOverrides: {
        outlined: {
          borderRadius: 4,
        },
        iconFilled: {
          top: 'calc(50% - .25em)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 45,
          height: 20,
          padding: 0,
          color: secondary,
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              transform: 'translateX(20px)',
              color: '#fff',
            },
          },
        },
        switchBase: {
          height: 20,
          width: 25,
          padding: 0,
          color: '#fff',
          '&.Mui-checked + .MuiSwitch-track': {
            opacity: 1,
          },
        },
        track: {
          opacity: 1,
          borderRadius: 32,
          backgroundColor: 'gray',
        },
        thumb: {
          flexShrink: 0,
          width: '14px',
          height: '14px',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableTouchRipple: true,
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          paddingTop: 7,
          paddingBottom: 7,
        },
      },
    },

    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6b6b6b #2b2b2b',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#2b2b2b',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#6b6b6b',
            minHeight: 24,
            border: '2px solid #2b2b2b',
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#959595',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#959595',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#959595',
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: '#2b2b2b',
          },
        },
      },
    },
  },
});

export default theme;

export const homePageFontSizeHeader = {
  fontSize: '2.5rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
  [theme.breakpoints.between('sm', 'md')]: {
    fontSize: '2rem',
  },
};

export const homePageFontSizeTitles = {
  fontSize: '1rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  },
};

export const homePageFontSizeSubtitles = {
  fontSize: '0.8rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
  },
};
