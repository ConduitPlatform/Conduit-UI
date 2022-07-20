import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  IAdmin,
  IAdminSettings,
  ICoreSettings,
  INewAdminUser,
} from '../../models/settings/SettingsModels';
import {
  changePassword,
  deleteAdmin,
  getAdmins,
  getAdminSettings,
  getCoreSettings,
  postNewAdminUser,
  patchAdminSettings,
  patchCoreSettings,
} from '../../http/requests/SettingsRequests';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { Pagination } from '../../models/http/HttpModels';

interface ISettingsSlice {
  data: {
    authAdmins: {
      admins: IAdmin[];
      count: number;
    };
  };
  coreSettings: ICoreSettings;
  adminSettings: IAdminSettings;
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
  },
  adminSettings: {
    auth: {
      tokenSecret: '',
      hashRounds: 11,
      tokenExpirationTime: 72000,
    },
    hostUrl: '',
    transports: { rest: true, graphql: false, sockets: false },
  },
};

export const asyncGetAdmins = createAsyncThunk(
  'authentication/getAdmins',
  async (params: Pagination, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getAdmins(params);

      thunkAPI.dispatch(setAppLoading(false));
      return data;
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
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully deleted admin!`));
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
  async (params: { values: INewAdminUser; getAdmins: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const body = {
        username: params.values.username,
        password: params.values.password,
      };

      await postNewAdminUser(body);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully created user ${body.username}!`));
      params.getAdmins();
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

export const asyncGetAdminSettings = createAsyncThunk(
  'settings/getAdmin',
  async (args, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getAdminSettings();
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUpdateAdminSettings = createAsyncThunk(
  'settings/putAdmin',
  async (args: IAdminSettings, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await patchAdminSettings(args);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUpdateCoreSettings = createAsyncThunk(
  'settings/putCore',
  async (args: ICoreSettings, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await patchCoreSettings(args);
      thunkAPI.dispatch(setAppLoading(false));
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
    builder.addCase(asyncGetAdminSettings.fulfilled, (state, action) => {
      state.adminSettings = action.payload.config;
    });
    builder.addCase(asyncUpdateCoreSettings.fulfilled, (state, action) => {
      state.coreSettings = action.payload.config;
    });
    builder.addCase(asyncUpdateAdminSettings.fulfilled, (state, action) => {
      state.adminSettings = action.payload.config;
    });
    builder.addCase(asyncGetAdmins.fulfilled, (state, action) => {
      state.data.authAdmins.admins = action.payload.result.admins;
      state.data.authAdmins.count = action.payload.result.count;
    });
  },
});

export default settingsSlice.reducer;
