import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteRelation,
  deleteResources,
  getAuthzSettings,
  getRelations,
  getRelationsById,
  getResources,
  getResourcesById,
  patchAuthzSettings,
  patchResources,
  postRelations,
  postResources,
} from '../http/AuthorizationRequests';
import {
  AuthzRelationType,
  AuthzResourceType,
  IAuthorizationConfig,
} from '../models/AuthorizationModels';
import { setAppLoading } from '../../../redux/slices/appSlice';
import { getErrorData } from '../../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../../hooks/useNotifier';
import { Pagination, Search, Sort } from '../../../models/http/HttpModels';

interface IAuthorizationSlice {
  resourceData: {
    resources: AuthzResourceType[];
    count: number;
  };
  relationData: {
    relations: AuthzRelationType[];
    count: number;
  };
  config: IAuthorizationConfig;
}

const initialState: IAuthorizationSlice = {
  resourceData: {
    resources: [],
    count: 0,
  },
  relationData: {
    relations: [],
    count: 0,
  },
  config: {
    active: false,
  },
};

export const asyncGetResources = createAsyncThunk(
  'authz/getResources',
  async (params: Pagination & Search & Sort, thunkAPI) => {
    try {
      const { data } = await getResources(params);
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetResourcesById = createAsyncThunk(
  'authz/getResourcesById',
  async (params: { id: string }, thunkAPI) => {
    try {
      const { data } = await getResourcesById(params.id);
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncPostResources = createAsyncThunk(
  'authz/postResources',
  async (params: AuthzResourceType, thunkAPI) => {
    try {
      const { data } = await postResources(params);
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncPatchResources = createAsyncThunk(
  'authz/postResources',
  async (params: { id: string; data: AuthzResourceType }, thunkAPI) => {
    try {
      const { data } = await patchResources(params.id, params.data);
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteResources = createAsyncThunk(
  'authz/deleteResources',
  async (params: { id: string }, thunkAPI) => {
    try {
      const { data } = await deleteResources(params.id);
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetRelations = createAsyncThunk(
  'authz/getRelations',
  async (params: Pagination & Search & Sort, thunkAPI) => {
    try {
      const { data } = await getRelations(params);
      return data;
    } catch (error) {
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetRelationsById = createAsyncThunk(
  'authz/getRelationsById',
  async (params: { id: string }, thunkAPI) => {
    try {
      const { data } = await getRelationsById(params.id);
      return data;
    } catch (error) {
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncPostRelations = createAsyncThunk(
  'authz/postRelations',
  async (params: AuthzRelationType, thunkAPI) => {
    try {
      const { data } = await postRelations(params);
      return data;
    } catch (error) {
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteRelations = createAsyncThunk(
  'authz/deleteRelations',
  async (params: { id: string }, thunkAPI) => {
    try {
      const { data } = await deleteRelation(params.id);
      return data;
    } catch (error) {
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetAuthzConfig = createAsyncThunk('authz/getConfig', async (arg, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const {
      data: { config },
    } = await getAuthzSettings();
    thunkAPI.dispatch(setAppLoading(false));
    return config;
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncUpdateAuthzConfig = createAsyncThunk(
  'authz/updateConfig',
  async (updatedSettings: IAuthorizationConfig, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await patchAuthzSettings(updatedSettings);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Authorization config successfully updated`));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);
const authorizationSlice = createSlice({
  name: 'authz',
  initialState,
  reducers: {
    clearAuthzPageStore: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetResources.fulfilled, (state, action) => {
      state.resourceData.resources = action.payload.found;
      state.resourceData.count = action.payload.count;
    });

    builder.addCase(asyncGetRelations.fulfilled, (state, action) => {
      state.relationData.relations = action.payload.relations;
      state.relationData.count = action.payload.count;
    });
    builder.addCase(asyncGetAuthzConfig.fulfilled, (state, action) => {
      state.config = action.payload;
    });
    builder.addCase(asyncUpdateAuthzConfig.fulfilled, (state, action) => {
      state.config = action.payload;
    });
  },
});

export default authorizationSlice.reducer;
export const { clearAuthzPageStore } = authorizationSlice.actions;
