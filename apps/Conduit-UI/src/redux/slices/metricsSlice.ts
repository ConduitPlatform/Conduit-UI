import { ModulesTypes } from '../../models/logs/LogsModels';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { setAppLoading } from './appSlice';
import { enqueueErrorNotification } from '../../utils/useNotifier';
import {
  MetricsData,
  MetricsLogsData,
  MetricsLogsDataRaw,
} from '../../models/metrics/metricsModels';
import {
  getGenericMetricCounterQuery,
  getGenericMetricQueryRange,
  getMetricsQuery,
  getModuleHealth,
  getModuleLatency,
} from '../../http/requests/MetricsRequests';
import moment, { Moment } from 'moment';
import { parseInt } from 'lodash';

interface IMetricsSlice {
  data: {
    genericMetric: Record<string, MetricsData>;
    metricCounter: Record<string, number>;
    moduleTotalRequests: Record<ModulesTypes, MetricsData>;
    moduleHealth: Record<ModulesTypes, boolean>;
    moduleLatency: Record<ModulesTypes, number>;
  };
  meta: {
    genericMetricLoading: Record<string, boolean>;
    metricCounterLoading: Record<string, boolean>;
    moduleTotalRequestsLoading: Record<ModulesTypes, boolean>;
    moduleHealthLoading: Record<ModulesTypes, boolean>;
    moduleLatencyLoading: Record<ModulesTypes, boolean>;
  };
}

const initialState: IMetricsSlice = {
  data: {
    genericMetric: {} as Record<string, MetricsData>,
    metricCounter: {} as Record<string, number>,
    moduleTotalRequests: {} as Record<ModulesTypes, MetricsData>,
    moduleHealth: {} as Record<ModulesTypes, boolean>,
    moduleLatency: {} as Record<ModulesTypes, number>,
  },
  meta: {
    genericMetricLoading: {} as Record<string, boolean>,
    metricCounterLoading: {} as Record<string, boolean>,
    moduleTotalRequestsLoading: {} as Record<ModulesTypes, boolean>,
    moduleHealthLoading: {} as Record<ModulesTypes, boolean>,
    moduleLatencyLoading: {} as Record<ModulesTypes, boolean>,
  },
};

const prepareData = (data: MetricsLogsDataRaw) => {
  const timestamps: number[] = [];
  const counters: number[] = [];

  const arr: [] = [];
  data?.data?.result.forEach((e: MetricsLogsData) => {
    e.values.forEach((item) => {
      arr.push(item);
    });
  });

  arr.map((item) => {
    const itemsTime = item?.[0] as Moment;
    const itemsCount = item?.[1];

    timestamps.push(moment(itemsTime.valueOf() * 1000).valueOf());
    counters.push(parseInt(itemsCount));
  });

  return { timestamps: timestamps, counters: counters };
};

export const asyncGetGenericMetricQueryRange = createAsyncThunk(
  '/metrics/getGenericMetric',
  async (
    body: {
      expression: string;
      startDate?: number;
      endDate?: number;
      step?: string;
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getGenericMetricQueryRange(body);
      thunkAPI.dispatch(setAppLoading(false));

      return prepareData(data);
    } catch (error: any) {
      thunkAPI.dispatch(setAppLoading(false));

      throw error;
    }
  }
);

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
      thunkAPI.dispatch(setAppLoading(false));

      return prepareData(data);
    } catch (error: any) {
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

export const asyncGetModuleHealth = createAsyncThunk(
  '/metrics/getModuleHealth',
  async (
    body: {
      module: ModulesTypes;
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getModuleHealth(body);
      thunkAPI.dispatch(setAppLoading(false));
      return data.data.result[0].values[0][1] === '1';
    } catch (error: any) {
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

export const asyncGetModuleLatency = createAsyncThunk(
  '/metrics/getModuleLatency',
  async (
    body: {
      module: ModulesTypes;
      modulesLength?: number;
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getModuleLatency(body);
      thunkAPI.dispatch(setAppLoading(false));

      let finalizedLatency;

      if (body.module === 'home' && body.modulesLength) {
        finalizedLatency = (data.data.result[0].value[1] * 1000) / body.modulesLength;
      } else if (body.module !== 'home') {
        finalizedLatency = data.data.result[0].value[1] * 1000;
      }
      return finalizedLatency;
    } catch (error: any) {
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

export const asyncGetCounter = createAsyncThunk(
  '/metrics/getMetricCounter',
  async (
    body: {
      expression: string;
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getGenericMetricCounterQuery(body.expression);
      thunkAPI.dispatch(setAppLoading(false));

      return data.data.result[0].values[0][1];
    } catch (error: any) {
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(asyncGetGenericMetricQueryRange.pending, (state, action) => {
      state.meta.genericMetricLoading[action.meta.arg.expression] = true;
    });
    builder.addCase(asyncGetGenericMetricQueryRange.fulfilled, (state, action) => {
      state.data.genericMetric[action.meta.arg.expression] = action.payload;
      state.meta.genericMetricLoading[action.meta.arg.expression] = false;
    });
    builder.addCase(asyncGetMetricsQuery.pending, (state, action) => {
      state.meta.moduleTotalRequestsLoading[action.meta.arg.module] = true;
    });
    builder.addCase(asyncGetMetricsQuery.fulfilled, (state, action) => {
      state.data.moduleTotalRequests[action.meta.arg.module] = action.payload;
      state.meta.moduleTotalRequestsLoading[action.meta.arg.module] = false;
    });
    builder.addCase(asyncGetModuleHealth.pending, (state, action) => {
      state.meta.moduleHealthLoading[action.meta.arg.module] = true;
    });
    builder.addCase(asyncGetModuleHealth.rejected, (state, action) => {
      state.meta.moduleHealthLoading[action.meta.arg.module] = false;
    });
    builder.addCase(asyncGetModuleHealth.fulfilled, (state, action) => {
      state.data.moduleHealth[action.meta.arg.module] = action.payload;
      state.meta.moduleHealthLoading[action.meta.arg.module] = false;
    });
    builder.addCase(asyncGetModuleLatency.pending, (state, action) => {
      state.meta.moduleLatencyLoading[action.meta.arg.module] = true;
    });
    builder.addCase(asyncGetModuleLatency.fulfilled, (state, action) => {
      if (action.payload !== undefined) {
        state.data.moduleLatency[action.meta.arg.module] = action.payload;
        state.meta.moduleLatencyLoading[action.meta.arg.module] = false;
      }
    });
    builder.addCase(asyncGetModuleLatency.rejected, (state, action) => {
      state.meta.moduleLatencyLoading[action.meta.arg.module] = false;
    });
    builder.addCase(asyncGetCounter.pending, (state, action) => {
      state.meta.metricCounterLoading[action.meta.arg.expression] = true;
    });
    builder.addCase(asyncGetCounter.fulfilled, (state, action) => {
      state.data.metricCounter[action.meta.arg.expression] = action.payload;
      state.meta.metricCounterLoading[action.meta.arg.expression] = false;
    });
  },
});

export default metricsSlice.reducer;
