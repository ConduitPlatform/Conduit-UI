import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  INotificationConfig,
  NotificationData,
} from '../../models/notifications/NotificationModels';
import {
  sendNotification,
  getNotificationConfig,
  patchNotificationConfig,
} from '../../http/requests/NotificationsRequests';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';

interface INotificationSlice {
  data: {
    config: INotificationConfig;
    notifications: NotificationData[];
  };
}

const initialState: INotificationSlice = {
  data: {
    config: {
      active: false,
      providerName: '',
      firebase: {
        projectId: '',
        privateKey: '',
        clientEmail: '',
      },
    },
    notifications: [],
  },
};

export const asyncSendNewNotification = createAsyncThunk(
  'notifications/sendNew',
  async (data: NotificationData, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await sendNotification(data);
      thunkAPI.dispatch(setAppLoading(false));
      return;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetNotificationConfig = createAsyncThunk(
  'notifications/getConfig',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await getNotificationConfig();
      thunkAPI.dispatch(setAppLoading(false));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncSaveNotificationConfig = createAsyncThunk(
  'notifications/saveConfig',
  async (settings: INotificationConfig, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await patchNotificationConfig(settings);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Notiufication config successfully updated`));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationPageStore: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetNotificationConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncSaveNotificationConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
  },
});

export const { clearNotificationPageStore } = notificationsSlice.actions;

export default notificationsSlice.reducer;
