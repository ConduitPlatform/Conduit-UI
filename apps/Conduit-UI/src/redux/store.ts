import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import appAuthSlice from './slices/appAuthSlice';
import authenticationSlice from './slices/authenticationSlice';
import notificationsSlice from './slices/notificationsSlice';
import storageSlice from './slices/storageSlice';
import settingsSlice from './slices/settingsSlice';
import emailsSlice from './slices/emailsSlice';
import databaseSlice from './slices/databaseSlice';
import routerSlice from './slices/routerSlice';
import customEndpointsSlice from './slices/customEndpointsSlice';
import smsSlice from './slices/smsSlice';
import { useMemo } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import appSlice from './slices/appSlice';
import formsSlice from './slices/formsSlice';
import chatSlice from './slices/chatSlice';
import paymentsSlice from './slices/paymentsSlice';
import logsSlice from './slices/LogsSlice';

let store: any;

export const makeStore = (preloadedState: any) =>
  configureStore({
    reducer: {
      appSlice,
      appAuthSlice,
      authenticationSlice,
      formsSlice,
      databaseSlice,
      customEndpointsSlice,
      notificationsSlice,
      paymentsSlice,
      storageSlice,
      settingsSlice,
      routerSlice,
      emailsSlice,
      smsSlice,
      chatSlice,
      logsSlice,
    },
    preloadedState,
  });

export const initializeStore = (preloadedState: any) => {
  let _store = store ?? makeStore(preloadedState);

  if (preloadedState && store) {
    _store = makeStore({ ...store.getState(), ...preloadedState });
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export const getCurrentStore = () => {
  return store;
};

export const useStore = (initialState: any) => {
  return useMemo(() => initializeStore(initialState), [initialState]);
};

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export default store;
