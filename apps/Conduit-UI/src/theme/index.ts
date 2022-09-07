import ArrowDropDownRounded from '@mui/icons-material/ArrowDropDownRounded';
import { PaletteMode, PaletteOptions } from '@mui/material';

const primary = '#07D9C4';
const secondary = '#5B44F2';

const error = '#ef476f';
const warning = '#E265AB';
const disabled = '#808080';

const paletteDark: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: primary,
    contrastText: '#F2F2F2',
  },
  secondary: {
    main: secondary,
    contrastText: '#000000',
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
};

const paletteLight: PaletteOptions = {
  mode: 'light',
  primary: {
    main: secondary,
    contrastText: '#F2F2F2',
  },
  secondary: {
    main: primary,
    contrastText: '#fff',
  },
  error: {
    main: error,
    contrastText: '#fff',
  },
  warning: {
    main: warning,
  },
  background: {
    paper: '#E8E7E7',
    default: '#F2F2F2',
  },
  action: {
    disabledBackground: 'transparent',
    disabled: disabled,
  },
};

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light' ? paletteLight : paletteDark),
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
        root: { '& .MuiInputBase-root': { borderRadius: 10, color: 'primary' } },
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
          color: primary,
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
      // styleOverrides: {},
    },
  },
});

export default getDesignTokens;

// export const homePageFontSizeTitles = {
//   fontSize: '1rem',
//   [theme.breakpoints.down('sm')]: {
//     fontSize: '0.8rem',
//   },
// };
