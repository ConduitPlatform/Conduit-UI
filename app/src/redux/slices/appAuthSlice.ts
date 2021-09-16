import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAdminModulesRequest, loginRequest } from '../../http/requests';
import { removeCookie, setCookie } from '../../utils/cookie';
import { IModule } from '../../models/appAuth';
import { clearEmailPageStore } from '../actions/emailsActions';
import { clearNotificationPageStore } from './notificationsSlice';
import { clearStoragePageStore } from './storageSlice';
import { clearAuthPageStore } from '../actions';

export type AppAuthState = {
  data: {
    token: string;
    enabledModules: IModule[];
  };
  meta: {
    loading: boolean;
    error: any;
  };
};

//TODO we should probably add types for JWT

const initialState: AppAuthState = {
  data: {
    token: '',
    enabledModules: [],
  },
  meta: {
    loading: false,
    error: null,
  },
};

export const asyncLogin = createAsyncThunk(
  'appAuth/login',
  async (values: { username: string; password: string; remember: boolean }) => {
    try {
      const username = values.username;
      const password = values.password;
      const { data } = await loginRequest(username, password);

      return { data, cookie: values.remember };
    } catch (error) {
      throw error;
    }
  }
);

export const asyncLogout = createAsyncThunk('appAuth/logout', async (arg, thunkAPI) => {
  thunkAPI.dispatch(clearAuthPageStore());
  thunkAPI.dispatch(clearEmailPageStore());
  thunkAPI.dispatch(clearNotificationPageStore());
  thunkAPI.dispatch(clearStoragePageStore());
});

export const asyncGetAdminModules = createAsyncThunk('appAuth/getModules', async () => {
  try {
    const { data } = await getAdminModulesRequest();
    return data;
  } catch (error) {
    throw error;
  }
});

const appAuthSlice = createSlice({
  name: 'appAuth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(asyncLogin.pending, (state) => {
      state.meta.loading = true;
    });
    builder.addCase(asyncLogin.rejected, (state, action) => {
      state.meta.loading = false;
      state.meta.error = action.error as Error;
    });
    builder.addCase(asyncLogin.fulfilled, (state, action) => {
      state.meta.loading = false;
      state.meta.error = null;
      setCookie('JWT', action.payload.data.token, action.payload.cookie);
      state.data.token = action.payload.data.token;
    });
    builder.addCase(asyncGetAdminModules.pending, (state) => {
      state.meta.loading = true;
    });
    builder.addCase(asyncGetAdminModules.rejected, (state, action) => {
      state.meta.loading = false;
      state.meta.error = action.error as Error;
    });
    builder.addCase(asyncGetAdminModules.fulfilled, (state, action) => {
      state.meta.loading = false;
      state.meta.error = null;
      state.data.enabledModules = action.payload.modules;
    });
    builder.addCase(asyncLogout.pending, (state) => {
      state.meta.loading = true;
    });
    builder.addCase(asyncLogout.rejected, (state, action) => {
      state.meta.loading = false;
      state.meta.error = action.error as Error;
    });
    builder.addCase(asyncLogout.fulfilled, (state) => {
      removeCookie('JWT');
      state.data.token = '';
      state.data.enabledModules = [];
      state.meta.loading = false;
      state.meta.error = null;
    });
  },
});

export default appAuthSlice.reducer;
