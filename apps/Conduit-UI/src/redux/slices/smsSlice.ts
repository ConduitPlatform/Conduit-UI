import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification } from '../../utils/useNotifier';
import { getSmsConfig, patchSmsConfig, sendSmsRequest } from '../../http/requests/SmsRequests';
import { ISendSms, ISmsConfig, ISmsProviders } from '../../models/sms/SmsModels';

interface ISmsSlice {
  data: {
    config: ISmsConfig;
  };
}

const initialState: ISmsSlice = {
  data: {
    config: {
      active: true,
      providerName: ISmsProviders.twilio,
      twilio: {
        phoneNumber: '',
        accountSID: '',
        authToken: '',
        verify: {
          active: false,
          serviceSid: '',
        },
      },
    },
  },
};

export const asyncSendSms = createAsyncThunk('sms/sendSms', async (params: ISendSms, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const { data } = await sendSmsRequest(params);
    thunkAPI.dispatch(setAppLoading(false));
    return data;
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncGetSmsConfig = createAsyncThunk('sms/getConfig', async (arg, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const {
      data: { config },
    } = await getSmsConfig();
    thunkAPI.dispatch(setAppLoading(false));
    return config;
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncPutSmsConfig = createAsyncThunk(
  'sms/putConfig',
  async (params: ISmsConfig, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await patchSmsConfig(params);
      thunkAPI.dispatch(setAppLoading(false));
      // return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const smsSlice = createSlice({
  name: 'sms',
  initialState,
  reducers: {
    clearSmsPageStore: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetSmsConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
  },
});

export const { clearSmsPageStore } = smsSlice.actions;

export default smsSlice.reducer;
