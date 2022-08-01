import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthUser, IAuthenticationConfig } from '../../models/authentication/AuthModels';
import {
  blockUnblockUsers,
  blockUser,
  createNewUsers,
  deleteUsers,
  editUser,
  getAuthenticationConfig,
  getAuthenticationLogsInstances,
  getAuthenticationLogsInstancesModules,
  getAuthenticationLogsLevels,
  getAuthenticationLogsQuery,
  getAuthenticationLogsQueryRange,
  getAuthUsersDataReq,
  patchAuthenticationConfig,
  unblockUser,
} from '../../http/requests/AuthenticationRequests';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { Pagination, Search } from '../../models/http/HttpModels';
import { LogsData } from '../../models/logs/LogsModels';
import moment from 'moment';

interface IAuthenticationSlice {
  data: {
    authUsers: {
      users: AuthUser[];
      count: number;
    };
    logs: LogsData;
    config: IAuthenticationConfig;
  };
}

const initialState: IAuthenticationSlice = {
  data: {
    authUsers: {
      users: [],
      count: 0,
    },
    logs: {
      levels: [],
      instances: [],
      modules: [],
      query: [
        {
          stream: {
            instance: '',
            level: '',
            module: 'core',
          },
          values: [],
        },
      ],
    },
    config: {
      active: false,
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
      generateRefreshToken: false,
      google: {
        enabled: false,
        accountLinking: true,
        OAuth2Flow: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      jwtSecret: '',
      local: {
        identifier: '',
        accountLinking: false,
        enabled: false,
        sendVerificationEmail: false,
        verificationRequired: false,
        verification_redirect_uri: '',
      },
      rateLimit: 3,
      refreshTokenInvalidationPeriod: 0,
      service: { enabled: false },
      tokenInvalidationPeriod: 0,
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
      setCookies: {
        enabled: false,
        options: {
          httpOnly: false,
          secure: false,
          signed: false,
          maxAge: 900000,
          domain: '',
          path: '',
          sameSite: 'Lax',
        },
      },
      twofa: { enabled: false },
    },
  },
};

export const asyncGetAuthUserData = createAsyncThunk(
  'authentication/getUserData',
  async (params: Pagination & Search & { provider: string } & { sort?: string }, thunkAPI) => {
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

export const asyncGetAuthenticationLevels = createAsyncThunk(
  '/authentication/getLevels',
  async (body: any, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { data },
      } = await getAuthenticationLogsLevels(body);

      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetAuthenticationInstances = createAsyncThunk(
  '/authentication/getInstances',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { data },
      } = await getAuthenticationLogsInstances();

      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetAuthenticationModules = createAsyncThunk(
  '/authentication/getModules',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { data },
      } = await getAuthenticationLogsInstancesModules();

      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetAuthenticationQuery = createAsyncThunk(
  '/authentication/getQuery',
  async (body: any, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: {
          data: { result },
        },
      } = await getAuthenticationLogsQuery(body);

      thunkAPI.dispatch(setAppLoading(false));
      return result;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetAuthenticationQueryRange = createAsyncThunk(
  '/authentication/getQueryRange',
  async (body: any, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: {
          data: { result },
        },
      } = await getAuthenticationLogsQueryRange(body);

      thunkAPI.dispatch(setAppLoading(false));
      return result;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetAuthenticationLogs = createAsyncThunk(
  'authentication/getLogs',
  async (body: any, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      thunkAPI.dispatch(asyncGetAuthenticationLevels(moment().valueOf() * 1000000));
      thunkAPI.dispatch(asyncGetAuthenticationInstances());
      thunkAPI.dispatch(asyncGetAuthenticationModules());
      thunkAPI.dispatch(asyncGetAuthenticationQuery(body));

      thunkAPI.dispatch(setAppLoading(false));
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
    clearQuery: (state) => {
      state.data.logs.query = initialState.data.logs.query;
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
    builder.addCase(asyncGetAuthenticationLevels.fulfilled, (state, action) => {
      state.data.logs.levels = action.payload;
    });
    builder.addCase(asyncGetAuthenticationInstances.fulfilled, (state, action) => {
      state.data.logs.instances = action.payload;
    });
    builder.addCase(asyncGetAuthenticationModules.fulfilled, (state, action) => {
      state.data.logs.modules = action.payload;
    });
    builder.addCase(asyncGetAuthenticationQuery.fulfilled, (state, action) => {
      state.data.logs.query = action.payload;
    });
    builder.addCase(asyncGetAuthenticationQueryRange.fulfilled, (state, action) => {
      state.data.logs.query = action.payload;
    });
  },
});

export const { clearAuthenticationPageStore, clearQuery } = authenticationSlice.actions;

export default authenticationSlice.reducer;
