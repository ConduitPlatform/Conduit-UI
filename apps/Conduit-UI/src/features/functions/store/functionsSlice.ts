import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteFunctionsRequest,
  getFunctionsRequest,
  getFunctionsSettingsRequest,
  patchFunctionRequest,
  patchFunctionsSettingsRequest,
  postFunctionRequest,
} from '../http/FunctionsRequests';
import { FunctionData, FunctionType, IFunctionsConfig } from '../models/FunctionsModels';
import { setAppLoading } from '../../../redux/slices/appSlice';
import { getErrorData } from '../../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../../hooks/useNotifier';
import { Pagination, Search, Sort } from '../../../models/http/HttpModels';

interface IFunctionsSlice {
  data: {
    functions: FunctionType[];
    totalCount: number;
    config: IFunctionsConfig;
  };
}

const initialState: IFunctionsSlice = {
  data: {
    functions: [],
    totalCount: 0,
    config: {
      active: false,
    },
  },
};

export const asyncGetFunctionsConfig = createAsyncThunk(
  'functions/getConfig',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await getFunctionsSettingsRequest();
      thunkAPI.dispatch(setAppLoading(false));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetSavedFunctions = createAsyncThunk(
  'functions/getFunctions',
  async (params: Pagination & Search & Sort, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getFunctionsRequest(params);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUpdateFunctionsConfig = createAsyncThunk(
  'functions/updateConfig',
  async (updatedSettings: IFunctionsConfig, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await patchFunctionsSettingsRequest(updatedSettings);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Emails config successfully updated`));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUploadFunction = createAsyncThunk(
  'functions/upload',
  async (functionData: FunctionData, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await postFunctionRequest(functionData);
      thunkAPI.dispatch(
        enqueueSuccessNotification(`Successfully created function ${functionData.name}!`)
      );
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncPatchFunction = createAsyncThunk(
  'functions/patch',
  async (functionData: { _id: string; data: Partial<FunctionData> }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await patchFunctionRequest(functionData._id, functionData.data);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully update function ${data.name}!`));
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteFunctions = createAsyncThunk(
  'functions/deleteMany',
  async (params: { ids: string[]; getTemplates: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteFunctionsRequest(params.ids);
      params.getTemplates();
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully deleted functions!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const updateFunctionyID = (updated: FunctionType, functions: FunctionType[]) => {
  return functions.map((t) => {
    if (t._id === updated._id) {
      return {
        ...updated,
      };
    } else {
      return t;
    }
  });
};

const functionsSlice = createSlice({
  name: 'functions',
  initialState,
  reducers: {
    clearFunctionsPageStore: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetFunctionsConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncUpdateFunctionsConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncGetSavedFunctions.fulfilled, (state, action) => {
      state.data.functions = action.payload.functions;
      state.data.totalCount = action.payload.count;
    });
    builder.addCase(asyncUploadFunction.fulfilled, (state, action) => {
      state.data.functions.push(action.payload);
      state.data.totalCount = state.data.totalCount++;
    });
    builder.addCase(asyncPatchFunction.fulfilled, (state, action) => {
      state.data.functions = updateFunctionyID(action.payload, state.data.functions);
    });
  },
});

export default functionsSlice.reducer;
export const { clearFunctionsPageStore } = functionsSlice.actions;
