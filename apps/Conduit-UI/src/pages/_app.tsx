import React, { ReactElement, ReactNode, useEffect, useState, useMemo, createContext } from 'react';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { AppContext, AppProps } from 'next/app';
import App from 'next/app';
import { Provider } from 'react-redux';
import Head from 'next/head';
import { initializeStore, useStore } from '../redux/store';
import { setToken } from '../redux/slices/appAuthSlice';
import { getCookie } from '../utils/cookie';
import { SnackbarMessage, SnackbarProvider } from 'notistack';
import Snackbar from '../components/navigation/Snackbar';
import './../theme/global.css';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import createEmotionCache from '../createEmotionCache';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { NextPage } from 'next';
import { createTheme, PaletteMode, responsiveFontSizes } from '@mui/material';
import getDesignTokens from '../theme';

const Layout = dynamic(() => import('../components/navigation/Layout'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const clientSideEmotionCache = createEmotionCache();

export const ColorModeContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleColorMode: () => {},
});

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

const ConduitApp = (props: MyAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const [mode, setMode] = useState<PaletteMode>('light');

  useEffect(() => {
    const storedMode = localStorage?.getItem('theme');
    if (storedMode) {
      setMode(storedMode === 'dark' ? 'dark' : 'light');
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) => {
          localStorage?.setItem('theme', prevMode === 'light' ? 'dark' : 'light');
          return prevMode === 'light' ? 'dark' : 'light';
        });
      },
    }),
    []
  );

  const theme = useMemo(() => {
    const newTheme = createTheme(getDesignTokens(mode));
    return responsiveFontSizes(newTheme);
  }, [mode]);

  const reduxStore = useStore(pageProps.initialReduxState);

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  const getLayout = Component.getLayout || ((page: ReactElement) => page);

  const formOptions = (optionsString: SnackbarMessage) => {
    if (optionsString == undefined) return {};
    return JSON.parse(optionsString as string);
  };

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Conduit - App</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Head>
      <Provider store={reduxStore}>
        <StyledEngineProvider>
          <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
              <SnackbarProvider
                preventDuplicate={true}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                content={(key, message) => <Snackbar id={key} options={formOptions(message)} />}>
                <CssBaseline />
                <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
              </SnackbarProvider>
            </ThemeProvider>
          </ColorModeContext.Provider>
        </StyledEngineProvider>
      </Provider>
    </CacheProvider>
  );
};

ConduitApp.getInitialProps = async (appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  const ctx = appContext.ctx;
  //initialize redux store on server side
  const reduxStore = initializeStore({});
  const { dispatch } = reduxStore;

  const cookie = getCookie('Bearer', ctx.req);

  if (
    typeof window === 'undefined' &&
    appContext &&
    appContext.ctx &&
    appContext.ctx.res &&
    appContext.ctx.res.writeHead
  ) {
    if (!cookie && ctx.pathname !== '/login') {
      appContext.ctx.res.writeHead(302, { Location: '/login' });
      appContext.ctx.res.end();
    }
  }

  //if user is already logged in and auth-token cookie exist, add it to redux auth-state
  dispatch(setToken({ token: cookie }));

  appProps.pageProps = {
    ...appProps.pageProps,
    cookie,
    initialReduxState: reduxStore.getState(),
  };

  return appProps;
};

export default ConduitApp;
