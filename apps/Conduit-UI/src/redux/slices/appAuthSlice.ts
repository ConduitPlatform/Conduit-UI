import { createAsyncThunk, createSlice, unwrapResult } from '@reduxjs/toolkit';
import { removeCookie, setCookie } from '../../utils/cookie';
import { IModule } from '../../models/appAuth';
import { asyncGetNotificationConfig, clearNotificationPageStore } from './notificationsSlice';
import { asyncGetStorageConfig, clearStoragePageStore } from './storageSlice';
import { getAdminModulesRequest } from '../../http/requests/SettingsRequests';
import { loginRequest, verifyTwoFARequest } from '../../http/requests/AppAuthRequests';
import { asyncGetInfo, clearAppNotifications, setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { asyncGetEmailConfig, clearEmailPageStore } from './emailsSlice';
import { asyncGetAuthenticationConfig, clearAuthenticationPageStore } from './authenticationSlice';
import { enqueueErrorNotification, enqueueInfoNotification } from '../../utils/useNotifier';
import { asyncGetChatConfig } from './chatSlice';
import { asyncGetFormsConfig } from './formsSlice';
import { asyncGetPaymentConfig } from './paymentsSlice';
import { asyncGetSmsConfig } from './smsSlice';
import { asyncGetRouterConfig } from './routerSlice';
import { asyncGetAdminSettings } from './settingsSlice';
import jwt_decode from 'jwt-decode';
import Router from 'next/router';
import { getDisabledModules, getSortedModules } from '../../components/modules/moduleUtils';

export type AppAuthState = {
  data: {
    token: string;
    enabledModules?: IModule[];
    disabledModules?: IModule[];
  };
};

const initialState: AppAuthState = {
  data: {
    token: '',
    enabledModules: undefined,
    disabledModules: undefined,
  },
};

export const asyncLogin = createAsyncThunk(
  'appAuth/login',
  async (values: { username: string; password: string; remember: boolean }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const username = values.username;
      const password = values.password;
      const { data } = await loginRequest(username, password);
      const decoded: { id: string; twoFaRequired: boolean; iat: number; exp: number } = jwt_decode(
        data.token
      );
      if (!decoded.twoFaRequired)
        thunkAPI.dispatch(enqueueInfoNotification(`Welcome ${username}!`));

      thunkAPI.dispatch(setAppLoading(false));
      return { data, cookie: values.remember };
    } catch (error) {
      thunkAPI.dispatch(
        enqueueErrorNotification(`Could not login! error msg:${getErrorData(error)}`)
      );
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

export const asyncverifyTwoFA = createAsyncThunk(
  'appAuth/verifyTwoFA',
  async (args: { code: string; remember: boolean; username: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await verifyTwoFARequest(args.code);

      thunkAPI.dispatch(enqueueInfoNotification(`Welcome ${args.username}!`));

      thunkAPI.dispatch(setAppLoading(false));
      return { data, remember: args.remember };
    } catch (error) {
      thunkAPI.dispatch(
        enqueueErrorNotification(`Could not login! error msg:${getErrorData(error)}`)
      );
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

export const asyncLogout = createAsyncThunk('appAuth/logout', async (arg: void, thunkAPI) => {
  thunkAPI.dispatch(clearAuthenticationPageStore());
  thunkAPI.dispatch(clearEmailPageStore());
  thunkAPI.dispatch(clearNotificationPageStore());
  thunkAPI.dispatch(clearStoragePageStore());
  thunkAPI.dispatch(clearAppNotifications());
});

export const asyncGetAdminModules = createAsyncThunk(
  'appAuth/getModules',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getAdminModulesRequest();
      const sortedModules = getSortedModules(data.modules);
      const enabledModules = sortedModules;
      const payloadModules = sortedModules.map((module: IModule) => module.moduleName);
      const disabledModules = getDisabledModules(payloadModules);
      thunkAPI.dispatch(setAppLoading(false));
      return { enabledModules, disabledModules };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncInitialData = createAsyncThunk('appAuth/initialData', async (arg, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    thunkAPI.dispatch(asyncGetInfo());
    thunkAPI.dispatch(asyncGetAdminSettings());
    const resultAction = await thunkAPI.dispatch(asyncGetAdminModules());
    const originalPromiseResult = unwrapResult(resultAction);
    originalPromiseResult.enabledModules.forEach((item) => {
      switch (item.moduleName) {
        case 'authentication':
          thunkAPI.dispatch(asyncGetAuthenticationConfig());
          break;
        case 'chat':
          thunkAPI.dispatch(asyncGetChatConfig());
          break;
        case 'email':
          thunkAPI.dispatch(asyncGetEmailConfig());
          break;
        case 'storage':
          thunkAPI.dispatch(asyncGetStorageConfig());
          break;
        case 'pushNotifications':
          thunkAPI.dispatch(asyncGetNotificationConfig());
          break;
        case 'forms':
          thunkAPI.dispatch(asyncGetFormsConfig());
          break;
        case 'payments':
          thunkAPI.dispatch(asyncGetPaymentConfig());
          break;
        case 'router':
          thunkAPI.dispatch(asyncGetRouterConfig());
          break;
        case 'sms':
          thunkAPI.dispatch(asyncGetSmsConfig());
          break;
        default:
          break;
      }
    });
    thunkAPI.dispatch(setAppLoading(false));
    return originalPromiseResult;
  } catch (error) {
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    thunkAPI.dispatch(setAppLoading(false));
    throw error;
  }
});

const appAuthSlice = createSlice({
  name: 'appAuth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.data.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncLogin.fulfilled, (state, action) => {
      setCookie('Bearer', action.payload.data.token, action.payload.cookie);
      state.data.token = action.payload.data.token;
    });
    builder.addCase(asyncverifyTwoFA.fulfilled, (state, action) => {
      setCookie('Bearer', action.payload.data.result, action.payload.remember);
      state.data.token = action.payload.data.result;
    });
    builder.addCase(asyncGetAdminModules.fulfilled, (state, action) => {
      state.data.enabledModules = action.payload.enabledModules;
      state.data.disabledModules = action.payload.disabledModules;
    });
    builder.addCase(asyncLogout.fulfilled, (state) => {
      removeCookie('Bearer');
      state.data.token = '';
      state.data.enabledModules = [];
      state.data.disabledModules = [];
      Router.replace('/login').catch(console.log);
    });
  },
});

export const { setToken } = appAuthSlice.actions;

export default appAuthSlice.reducer;
