import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IAdmin, IAdminSettings, ICoreSettings, INewAdminUser } from './SettingsModels';
import {
  changePassword,
  deleteAdmin,
  getAdmins,
  getAdminSettings,
  getCoreSettings,
  postNewAdminUser,
  patchAdminSettings,
  patchCoreSettings,
  changeOtherAdminsPassword,
  toggleTwoFA,
  getAdminById,
  verifyQrCodeRequest,
} from './SettingsRequests';
import { setAppLoading } from '../../redux/slices/appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../hooks/useNotifier';
import { Pagination } from '../../models/http/HttpModels';

interface ISettingsSlice {
  data: {
    authAdmins: {
      admins: IAdmin[];
      count: number;
    };
    selectedAdmin: IAdmin;
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
    selectedAdmin: {
      createdAt: '',
      email: '',
      username: '',
      updatedAt: '',
      _id: '',
      isSuperAdmin: false,
      hasTwoFa: false,
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

export const asyncGetAdminById = createAsyncThunk(
  'authentication/getAdminById',
  async (id: string, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getAdminById(id);
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
      await deleteAdmin(params.id);
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
      await changePassword(params.oldPassword, params.newPassword);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Password changed!`));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncChangeOtherAdminsPassword = createAsyncThunk(
  'authentication/changeOtherAdminsPassword',
  async (params: { adminId: string; newPassword: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await changeOtherAdminsPassword(params.adminId, params.newPassword);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Password changed!`));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncToggleTwoFA = createAsyncThunk(
  'authentication/enableTwoFA',
  async (args: { enabled: boolean }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await toggleTwoFA(args.enabled);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Two factor authentication enabled!`));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncVerifyQrCode = createAsyncThunk(
  'appAuth/verifyQrCode',
  async (args: { code: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await verifyQrCodeRequest(args.code);
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(
        enqueueErrorNotification(`Could not login! error msg:${getErrorData(error)}`)
      );
      thunkAPI.dispatch(setAppLoading(false));
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
      state.data.authAdmins.admins = action.payload.admins;
      state.data.authAdmins.count = action.payload.count;
    });
    builder.addCase(asyncGetAdminById.fulfilled, (state, action) => {
      state.data.selectedAdmin = action.payload;
    });
  },
});

export default settingsSlice.reducer;
