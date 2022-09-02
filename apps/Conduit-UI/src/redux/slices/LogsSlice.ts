import { LogsData, LokiLogsData, ModulesTypes } from '../../models/logs/LogsModels';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { setAppLoading } from './appSlice';
import { enqueueErrorNotification } from '../../utils/useNotifier';
import { getErrorData } from '../../utils/error-handler';
import { getLogsLevels, getLogsQueryRange } from '../../http/requests/LogsRequests';

interface ILogsSlice {
  logs: Record<ModulesTypes, LogsData[]>;
  levels: string[];
  modules: ModulesTypes[];
}

const initialState: ILogsSlice = {
  logs: {} as Record<ModulesTypes, LogsData[]>,
  modules: [],
  levels: [],
};

export const asyncGetLevels = createAsyncThunk(
  '/authentication/getLevels',
  async (body: { startDate?: number; endDate?: number }, thunkAPI) => {
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

export const asyncGetQueryRange = createAsyncThunk(
  '/authentication/getQueryRange',
  async (
    body: {
      module: ModulesTypes;
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

      const arr: LogsData[] = [];

      result?.forEach((item: LokiLogsData) =>
        item?.values?.forEach((value) => {
          arr.push({
            timestamp: parseInt(value?.[0]),
            message: value?.[1],
            level: item?.stream?.level,
            instance: item?.stream?.instance,
          });
        })
      );
      arr.sort((a, b) => {
        const dateStart = a?.timestamp;
        const dateEnd = b?.timestamp;
        return dateEnd - dateStart;
      });

      thunkAPI.dispatch(setAppLoading(false));
      return arr;
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
    builder.addCase(asyncGetQueryRange.fulfilled, (state, action) => {
      state.logs[action.meta.arg.module] = action.payload;
    });
  },
});

export default logsSlice.reducer;
