import { LogsData, ModulesTypes } from '../../models/logs/LogsModels';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { setAppLoading } from './appSlice';
import { enqueueErrorNotification } from '../../utils/useNotifier';
import { getErrorData } from '../../utils/error-handler';
import {
  getLogsInstances,
  getLogsLevels,
  getLogsQueryRange,
} from '../../http/requests/LogsRequests';

interface ILogsSlice {
  logs: Record<ModulesTypes, LogsData[]>;
  levels: string[];
  instances: string[];
  modules: ModulesTypes[];
}

const initialState: ILogsSlice = {
  logs: {} as Record<ModulesTypes, LogsData[]>,
  instances: [],
  modules: [],
  levels: [],
};

export const asyncGetLevels = createAsyncThunk(
  '/authentication/getLevels',
  async (body: { startDate?: number }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { data },
      } = await getLogsLevels(body);

      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetInstances = createAsyncThunk(
  '/authentication/getInstances',
  async (body: { startDate?: number }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { data },
      } = await getLogsInstances(body);

      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetQueryRange = createAsyncThunk(
  '/authentication/getQueryRange',
  async (
    body: {
      module: ModulesTypes;
      instances?: string[];
      levels?: string[];
      startDate?: number;
      endDate?: number;
      limit?: number;
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: {
          data: { result },
        },
      } = await getLogsQueryRange(body);

      thunkAPI.dispatch(setAppLoading(false));
      return result;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(asyncGetLevels.fulfilled, (state, action) => {
      state.levels = action.payload;
    });
    builder.addCase(asyncGetInstances.fulfilled, (state, action) => {
      state.instances = action.payload;
    });
    builder.addCase(asyncGetQueryRange.fulfilled, (state, action) => {
      state.logs[action.meta.arg.module] = action.payload;
    });
  },
});

export default logsSlice.reducer;
