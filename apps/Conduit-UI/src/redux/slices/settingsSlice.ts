import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ICoreSettings, INewAdminUser } from '../../models/settings/SettingsModels';
import {
  changePassword,
  deleteAdmin,
  getAdmins,
  getCoreSettings,
  postNewAdminUser,
  putCoreSettings,
} from '../../http/SettingsRequests';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { Pagination } from '../../models/http/HttpModels';
import { AuthUser } from '../../models/authentication/AuthModels';

interface ISettingsSlice {
  data: {
    authAdmins: {
      admins: AuthUser[];
      count: number;
    };
  };
  coreSettings: ICoreSettings;
}

const initialState: ISettingsSlice = {
  data: {
    authAdmins: {
      admins: [],
      count: 0,
    },
  },
  coreSettings: {
    env: '',
    hostUrl: '',
    transports: { rest: { enabled: false }, graphql: { enabled: false } },
    port: 8080,
  },
};

export const asyncGetAdmins = createAsyncThunk(
  'authentication/getAdmins',
  async (params: Pagination, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getAdmins(params);
      console.log(data);
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteAdmin = createAsyncThunk(
  'authentication/deleteAdmin',
  async (params: { id: string; getAdmins: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await deleteAdmin(params.id);
      params.getAdmins();
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncChangePassword = createAsyncThunk(
  'authentication/changePassword',
  async (params: { newPassword: string; oldPassword: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await changePassword(params.newPassword, params.oldPassword);

      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncCreateAdminUser = createAsyncThunk(
  'settings/createAdminUser',
  async (values: INewAdminUser, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const body = {
        username: values.username,
        password: values.password,
      };
      await postNewAdminUser(body);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully created user ${body.username}!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetCoreSettings = createAsyncThunk('settings/getCore', async (args, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const { data } = await getCoreSettings();
    return data;
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncUpdateCoreSettings = createAsyncThunk(
  'settings/putCore',
  async (args: ICoreSettings, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await putCoreSettings(args);
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(asyncGetCoreSettings.fulfilled, (state, action) => {
      state.coreSettings = action.payload.config;
    });
    builder.addCase(asyncUpdateCoreSettings.fulfilled, (state, action) => {
      state.coreSettings = action.payload;
    });
  },
});

export default settingsSlice.reducer;
