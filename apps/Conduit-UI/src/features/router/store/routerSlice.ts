import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { setAppLoading } from '../../../redux/slices/appSlice';
import { getErrorData } from '../../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../../hooks/useNotifier';
import ClientPlatformEnum, { IClient, IUpdateClient } from '../models/SecurityModels';
import { CaptchaProvider, IRouterConfig } from '../models/RouterModels';
import {
  deleteClientRequest,
  generateNewClientRequest,
  getAvailableClientsRequest,
  getRouterConfig,
  getRouterRoutes,
  patchRouterConfig,
  updateSecurityClient,
} from '../http/SecurityRequests';
import { Sort } from '../../../models/http/HttpModels';

interface IRouterSlice {
  data: {
    availableClients: IClient[];
    availableRoutes: { [key: string]: any };
    clientSecret: string;
    config: IRouterConfig;
  };
}

const initialState: IRouterSlice = {
  data: {
    config: {
      hostUrl: '',
      transports: { rest: false, graphql: false, sockets: false },
      security: { clientValidation: false },
      captcha: { provider: CaptchaProvider.recaptcha, enabled: false, secretKey: '' },
      cors: {
        enabled: false,
        origin: '',
        methods: '',
        allowedHeaders: '',
        exposedHeaders: '',
        credentials: false,
        maxAge: 0,
      },
    },
    clientSecret: '',
    availableClients: [],
    availableRoutes: {},
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

export const asyncGetAvailableRoutes = createAsyncThunk(
  'security/getRoutes',
  async (args: void, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getRouterRoutes();
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUpdateClient = createAsyncThunk(
  'security/updateClient',
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

export const asyncGetRouterConfig = createAsyncThunk(
  'security/getConfig',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await getRouterConfig();
      thunkAPI.dispatch(setAppLoading(false));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncPutRouterConfig = createAsyncThunk(
  'security/putConfig',
  async (params: IRouterConfig, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await patchRouterConfig(params);
      thunkAPI.dispatch(setAppLoading(false));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const routerSlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    clearClientSecret: (state) => {
      state.data.clientSecret = '';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetRouterConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncPutRouterConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncGetAvailableClients.fulfilled, (state, action) => {
      state.data.availableClients = action.payload;
    });
    builder.addCase(asyncGetAvailableRoutes.fulfilled, (state, action) => {
      debugger;
      state.data.availableRoutes = action.payload;
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

export const { clearClientSecret } = routerSlice.actions;

export default routerSlice.reducer;
