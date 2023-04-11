import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthTeam, AuthTeamFields, AuthUser, IAuthenticationConfig } from '../models/AuthModels';
import {
  addTeamMembers,
  blockUnblockUsers,
  blockUser,
  createTeam,
  createUser,
  deleteTeam,
  deleteTeamMembers,
  deleteUsers,
  editTeam,
  editTeamMembers,
  editUser,
  getAuthenticationConfig,
  getTeamMembers,
  getTeams,
  getUsers,
  patchAuthenticationConfig,
  unblockUser,
} from '../http/AuthenticationRequests';
import { setAppLoading } from '../../../redux/slices/appSlice';
import { getErrorData } from '../../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../../hooks/useNotifier';
import { Pagination, Search, Sort } from '../../../models/http/HttpModels';

interface IAuthenticationSlice {
  data: {
    authUsers: {
      users: AuthUser[];
      count: number;
    };
    authTeams: {
      teams: AuthTeam[];
      count: number;
      teamMembers: AuthUser[];
      membersCount: number;
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
    authTeams: {
      teams: [],
      count: 0,
      teamMembers: [],
      membersCount: 0,
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
          domain: '',
          sameSite: 'Lax',
          path: '',
        },
      },
      clients: {
        multipleUserSessions: false,
        multipleClientLogins: true,
      },
      teams: {
        enabled: false,
        enableDefaultTeam: false,
        allowAddWithoutInvite: false,
        allowEmailMismatchForInvites: false,
        invites: {
          enabled: false,
          sendEmail: false,
          inviteUrl: '',
        },
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
      captcha: {
        enabled: false,
        acceptablePlatform: {
          android: false,
          web: false,
        },
        routes: {
          login: false,
          register: false,
          oAuth2: false,
        },
      },
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
      twitter: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      linkedin: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      reddit: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      bitbucket: {
        accountLinking: false,
        enabled: false,
        clientId: '',
        redirect_uri: '',
        clientSecret: '',
      },
      apple: {
        enabled: false,
        accountLinking: false,
        clientId: '',
        keyId: '',
        privateKey: '',
        teamId: '',
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
  async (params: Pagination & Search & Sort & { provider?: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getUsers(params);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
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
      await createUser(params.values);
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

export const asyncGetAuthTeamData = createAsyncThunk(
  'authentication/getTeamData',
  async (params: Pagination & Search & Sort & { parentTeam?: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getTeams(params);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncAddNewTeam = createAsyncThunk(
  'authentication/addTeam',
  async (
    params: {
      values: AuthTeamFields;
      getTeams: () => void;
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await createTeam(params.values);
      params.getTeams();
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully added ${params.values.name}!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncEditTeam = createAsyncThunk(
  'authentication/editTeam',
  async (values: { _id: string } & AuthTeamFields, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await editTeam(values);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully edited team ${values.name}!`));
      thunkAPI.dispatch(setAppLoading(false));
      return values;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteTeam = createAsyncThunk(
  'authentication/deleteTeam',
  async (params: { id: string; getTeams: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteTeam(params.id);
      params.getTeams();
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully deleted team!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncAddNewTeamMembers = createAsyncThunk(
  'authentication/addTeamMembers',
  async (
    params: {
      getParams: Pagination & Search & Sort;
      values: { _id: string; members: string[] };
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await addTeamMembers(params.values);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully added team members!`));
      const { data } = await getTeamMembers({ _id: params.values._id, ...params.getParams });
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetAuthTeamMembersData = createAsyncThunk(
  'authentication/getTeamMembersData',
  async (params: Pagination & Search & Sort & { _id: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getTeamMembers(params);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncEditTeamMembers = createAsyncThunk(
  'authentication/editTeamMembers',
  async (
    {
      getParams,
      ...values
    }: { _id: string; members: string[]; role: string; getParams: Pagination & Search & Sort },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await editTeamMembers(values);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully edited team members!`));
      const { data } = await getTeamMembers({ _id: values._id, ...getParams });
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteTeamMembers = createAsyncThunk(
  'authentication/deleteTeam',
  async (
    {
      getParams,
      ...params
    }: { _id: string; members: string[]; getParams: Pagination & Search & Sort },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteTeamMembers(params);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully removed team members!`));
      const { data } = await getTeamMembers({ _id: params._id, ...getParams });
      thunkAPI.dispatch(setAppLoading(false));
      return data;
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
    builder.addCase(asyncGetAuthTeamData.fulfilled, (state, action) => {
      state.data.authTeams.teams = action.payload.teams;
      state.data.authTeams.count = action.payload.count;
    });
    builder.addCase(asyncEditTeam.fulfilled, (state, action) => {
      const foundIndex = state.data.authTeams.teams.findIndex(
        (team) => team._id === action.payload._id
      );
      if (foundIndex !== -1)
        state.data.authTeams.teams.splice(foundIndex, 1, {
          ...state.data.authTeams.teams[foundIndex],
          ...action.payload,
        });
    });
    builder.addCase(asyncGetAuthTeamMembersData.fulfilled, (state, action) => {
      state.data.authTeams.teamMembers = action.payload.members;
      state.data.authTeams.membersCount = action.payload.count;
    });
    builder.addCase(asyncAddNewTeamMembers.fulfilled, (state, action) => {
      state.data.authTeams.teamMembers = action.payload.members;
      state.data.authTeams.membersCount = action.payload.count;
    });
    builder.addCase(asyncEditTeamMembers.fulfilled, (state, action) => {
      state.data.authTeams.teamMembers = action.payload.members;
      state.data.authTeams.membersCount = action.payload.count;
    });
    builder.addCase(asyncDeleteTeamMembers.fulfilled, (state, action) => {
      state.data.authTeams.teamMembers = action.payload.members;
      state.data.authTeams.membersCount = action.payload.count;
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
