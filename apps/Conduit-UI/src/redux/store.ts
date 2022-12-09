import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import appAuthSlice from './slices/appAuthSlice';
import authenticationSlice from '../features/authentication/store/authenticationSlice';
import notificationsSlice from '../features/notifications/store/notificationsSlice';
import storageSlice from '../features/storage/storageSlice';
import settingsSlice from '../features/settings/store/settingsSlice';
import emailsSlice from '../features/emails/store/emailsSlice';
import databaseSlice from '../features/database/store/databaseSlice';
import routerSlice from '../features/router/store/routerSlice';
import customEndpointsSlice from '../features/database/store/customEndpointsSlice';
import smsSlice from '../features/sms/smsSlice';
import { useMemo } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import appSlice from './slices/appSlice';
import formsSlice from '../features/forms/store/formsSlice';
import chatSlice from '../features/chat/store/chatSlice';
import paymentsSlice from '../features/payments/store/paymentsSlice';
import logsSlice from './slices/logsSlice';
import metricsSlice from './slices/metricsSlice';

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
      metricsSlice,
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
