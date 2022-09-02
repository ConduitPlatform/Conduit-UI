import { ModulesTypes } from '../../models/logs/LogsModels';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { setAppLoading } from './appSlice';
import { enqueueErrorNotification } from '../../utils/useNotifier';
import { MetricsData, MetricsLogsData } from '../../models/metrics/metricsModels';
import { getMetricsQuery } from '../../http/requests/MetricsRequests';
import moment, { Moment } from 'moment';

interface IMetricsSlice {
  metrics: Record<ModulesTypes, MetricsData[]>;
}

const initialState: IMetricsSlice = {
  metrics: {} as Record<ModulesTypes, MetricsData[]>,
};

export const asyncGetMetricsQuery = createAsyncThunk(
  '/metrics/getQueryRange',
  async (
    body: {
      module: ModulesTypes;
      startDate?: number;
      endDate?: number;
      step?: string;
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getMetricsQuery(body);

      const timestamps: number[] = [];
      const counters: number[] = [];

      const arr: [] = [];
      data?.data?.result.forEach((e: MetricsLogsData) => {
        e.values.forEach((item) => {
          arr.push(item);
        });
      });

      arr.sort((a, b) => {
        return a?.[0] - b?.[0];
      });

      arr.map((item) => {
        const itemsTime = item?.[0] as Moment;
        const itemsCount = item?.[1];

        timestamps.push(moment(itemsTime.valueOf() * 1000).valueOf());
        counters.push(parseInt(itemsCount));
      });

      thunkAPI.dispatch(setAppLoading(false));
      return [{ timestamps: timestamps, counters: counters }];
    } catch (error: any) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${error?.data?.error}`));
      throw error;
    }
  }
);

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(asyncGetMetricsQuery.fulfilled, (state, action) => {
      state.metrics[action.meta.arg.module] = action.payload;
    });
  },
});

export default metricsSlice.reducer;
