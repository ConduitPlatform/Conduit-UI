import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthUser, IAuthenticationConfig } from '../../models/authentication/AuthModels';
import {
  blockUnblockUsers,
  blockUser,
  createNewUsers,
  deleteUsers,
  editUser,
  getAuthenticationConfig,
  getAuthUsersDataReq,
  patchAuthenticationConfig,
  unblockUser,
} from '../../http/requests/AuthenticationRequests';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { Pagination, Search } from '../../models/http/HttpModels';

interface IAuthenticationSlice {
  data: {
    authUsers: {
      users: AuthUser[];
      count: number;
    };
    config: IAuthenticationConfig;
  };
}

const initialState: IAuthenticationSlice = {
  data: {
    authUsers: {
      users: [],
      count: 0,
    },
    config: {
      active: false,
      accessTokens: {
        jwtSecret: '',
        expiryPeriod: 0,
        setCookie: false,
        cookieOptions: {
          httpOnly: false,
          secure: false,
          signed: false,
          maxAge: 0,
          domain: '',
          sameSite: 'Lax',
          path: '',
        },
      },
      refreshTokens: {
        enabled: false,
        expiryPeriod: 0,
        setCookie: false,
        cookieOptions: {
          httpOnly: false,
          secure: false,
          signed: false,
          maxAge: 0,
          domain: '',
          sameSite: 'Lax',
          path: '',
        },
      },
      clients: {
        multipleUserSessions: false,
        multipleClientLogins: true,
      },
      phoneAuthentication: {
        enabled: false,
      },
      facebook: {
        enabled: false,
        accountLinking: true,
        clientId: '',
        OAuth2Flow: false,
        redirect_uri: '',
        clientSecret: '',
      },
      google: {
        enabled: false,
        accountLinking: true,
        OAuth2Flow: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      magic_link: {
        enabled: false,
        redirect_uri: '',
      },
      local: {
        identifier: '',
        accountLinking: false,
        enabled: false,
        sendVerificationEmail: false,
        verificationRequired: false,
        verification_redirect_uri: '',
      },
      service: { enabled: false },

      twitch: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      github: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      gitlab: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      figma: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      microsoft: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      slack: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      twoFa: { enabled: false, methods: { authenticator: false, sms: false } },
    },
  },
};

export const asyncGetAuthUserData = createAsyncThunk(
  'authentication/getUserData',
  async (params: Pagination & Search & { provider?: string } & { sort?: string }, thunkAPI) => {
    try {
      const { data } = await getAuthUsersDataReq(params);
      return data;
    } catch (error) {
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncAddNewUser = createAsyncThunk(
  'authentication/addUser',
  async (
    params: { values: { password: string; email: string }; getUsers: () => void },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await createNewUsers(params.values);
      params.getUsers();
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully added ${params.values.email}!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncEditUser = createAsyncThunk(
  'authentication/editUser',
  async (values: AuthUser, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await editUser(values);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully edited user ${values.email}!`));
      thunkAPI.dispatch(setAppLoading(false));
      return values;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncBlockUserUI = createAsyncThunk(
  'authentication/blockUser',
  async (id: string, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await blockUser(id);
      thunkAPI.dispatch(setAppLoading(false));
      return id;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncBlockUnblockUsers = createAsyncThunk(
  'authentication/blockUnblockUsers',
  async (params: { body: { ids: string[]; block: boolean }; getUsers: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await blockUnblockUsers(params.body);
      thunkAPI.dispatch(setAppLoading(false));
      params.getUsers();
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUnblockUserUI = createAsyncThunk(
  'authentication/unblockUser',
  async (id: string, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await unblockUser(id);
      thunkAPI.dispatch(setAppLoading(false));
      return id;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteUsers = createAsyncThunk(
  'authentication/deleteUsers',
  async (params: { ids: string[]; getUsers: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteUsers(params.ids);
      params.getUsers();
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully deleted users!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetAuthenticationConfig = createAsyncThunk(
  'authentication/getConfig',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await getAuthenticationConfig();
      thunkAPI.dispatch(setAppLoading(false));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUpdateAuthenticationConfig = createAsyncThunk(
  'authentication/updateConfig',
  async (body: any, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await patchAuthenticationConfig(body);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Authentication config successfully updated`));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    clearAuthenticationPageStore: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetAuthUserData.fulfilled, (state, action) => {
      state.data.authUsers.users = action.payload.users;
      state.data.authUsers.count = action.payload.count;
    });
    builder.addCase(asyncEditUser.fulfilled, (state, action) => {
      const foundIndex = state.data.authUsers.users.findIndex(
        (user) => user._id === action.payload._id
      );
      if (foundIndex !== -1) state.data.authUsers.users.splice(foundIndex, 1, action.payload);
    });
    builder.addCase(asyncBlockUserUI.fulfilled, (state, action) => {
      const userToBlock = state.data.authUsers.users.find((user) => user._id === action.payload);
      if (userToBlock) {
        userToBlock.active = false;
      }
    });
    builder.addCase(asyncUnblockUserUI.fulfilled, (state, action) => {
      const userToUnBlock = state.data.authUsers.users.find((user) => user._id === action.payload);
      if (userToUnBlock) {
        userToUnBlock.active = true;
      }
    });
    builder.addCase(asyncGetAuthenticationConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncUpdateAuthenticationConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
  },
});

export const { clearAuthenticationPageStore } = authenticationSlice.actions;

export default authenticationSlice.reducer;
