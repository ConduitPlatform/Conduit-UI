import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { OptionsObject, SnackbarMessage } from 'notistack';
import { getRequestInfo } from '../../http/requestsConfig';

export interface INotification {
  message: SnackbarMessage;
  options: OptionsObject;
}

export type AppState = {
  loading: boolean;
  notifications: INotification[];
  info: Record<string, any>;
};

const initialState: AppState = {
  loading: false,
  notifications: [],
  info: {},
};

export const asyncGetInfo = createAsyncThunk('app/getInfo', async () => {
  try {
    const { data } = await getRequestInfo();
    return data;
  } catch (error) {
    throw error;
  }
});

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearAppNotifications: (state) => {
      state.notifications = [];
    },
    addSnackbar: (state, action) => {
      const key = action.payload.options && action.payload.options.key;
      const notification = {
        ...action.payload,
        key: key || uuidv4(),
      };
      state.notifications = [
        ...state.notifications,
        {
          key: key,
          ...notification,
        },
      ];
    },
    removeSnackbar: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification: { options: OptionsObject }) => notification.options.key !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetInfo.fulfilled, (state, action) => {
      state.info = action.payload;
    });
  },
});

export const { setAppLoading, addSnackbar, removeSnackbar, clearAppNotifications } =
  appSlice.actions;

export default appSlice.reducer;
