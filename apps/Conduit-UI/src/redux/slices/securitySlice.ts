import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import ClientPlatformEnum, {
  IClient,
  ISecurityConfig,
  IUpdateClient,
} from '../../models/security/SecurityModels';
import {
  deleteClientRequest,
  generateNewClientRequest,
  getAvailableClientsRequest,
  getSecurityConfig,
  putSecurityConfig,
  updateSecurityClient,
} from '../../http/SecurityRequests';
import { Sort } from '../../models/http/HttpModels';

interface ISecuritySlice {
  data: {
    availableClients: IClient[];
    clientSecret: string;
    config: ISecurityConfig;
  };
}

const initialState: ISecuritySlice = {
  data: {
    config: {
      hostUrl: '',
      transports: { rest: false, graphql: false, sockets: false },
      security: { clientValidation: false },
    },
    clientSecret: '',
    availableClients: [],
  },
};

export const asyncGetAvailableClients = createAsyncThunk(
  'security/getClients',
  async (args: Sort, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { clients },
      } = await getAvailableClientsRequest(args);
      thunkAPI.dispatch(setAppLoading(false));
      return clients;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUpdateClient = createAsyncThunk(
  'security/deleteClient',
  async (args: { _id: string; data: IUpdateClient }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await updateSecurityClient(args._id, args.data);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully updated client!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGenerateNewClient = createAsyncThunk(
  'security/generateClient',
  async (
    clientData: { platform: ClientPlatformEnum; domain?: string; notes?: string; alias?: string },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await generateNewClientRequest(
        clientData.platform,
        clientData.domain,
        clientData.notes,
        clientData.alias
      );
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully created client!`));

      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteClient = createAsyncThunk(
  'security/deleteClient',
  async (_id: string, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteClientRequest(_id);
      thunkAPI.dispatch(setAppLoading(false));
      return _id;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetSecurityConfig = createAsyncThunk(
  'security/getConfig',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await getSecurityConfig();
      thunkAPI.dispatch(setAppLoading(false));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncPutSecurityConfig = createAsyncThunk(
  'security/putConfig',
  async (params: ISecurityConfig, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await putSecurityConfig(params);
      thunkAPI.dispatch(setAppLoading(false));
      // return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const settingsSlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    clearClientSecret: (state) => {
      state.data.clientSecret = '';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetSecurityConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncGetAvailableClients.fulfilled, (state, action) => {
      state.data.availableClients = action.payload;
    });
    builder.addCase(asyncGenerateNewClient.fulfilled, (state, action) => {
      state.data.availableClients.push(action.payload);
      state.data.clientSecret = action.payload.clientSecret;
    });
    builder.addCase(asyncDeleteClient.fulfilled, (state, action) => {
      const allClients = state.data.availableClients;
      const clientIndex = allClients.findIndex((c) => c._id === action.payload);
      if (clientIndex !== -1) {
        allClients.splice(clientIndex, 1);
      }
    });
  },
});

export const { clearClientSecret } = settingsSlice.actions;

export default settingsSlice.reducer;
