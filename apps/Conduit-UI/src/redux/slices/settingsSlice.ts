import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ICoreSettings, INewAdminUser } from '../../models/settings/SettingsModels';
import { getCoreSettings, postNewAdminUser } from '../../http/SettingsRequests';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';

interface ISettingsSlice {
  data: any;
  coreSettings: ICoreSettings;
}

const initialState: ISettingsSlice = {
  data: {},
  coreSettings: {
    env: '',
    hostUrl: '',
    transports: { rest: { enabled: false }, graphql: { enabled: false } },
    port: 8080,
  },
};
export const asyncCreateAdminUser = createAsyncThunk(
  'settings/createAdminUser',
  async (values: INewAdminUser, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const body = {
        username: values.username,
        password: values.password,
      };
      await postNewAdminUser(body);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully created user ${body.username}!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetCoreSettings = createAsyncThunk('settings/getCore', async (args, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const { data } = await getCoreSettings();
    return data;
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncUpdateCoreSettings = createAsyncThunk(
  'settings/putCore',
  async (args, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getCoreSettings();
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(asyncGetCoreSettings.fulfilled, (state, action) => {
      state.coreSettings = action.payload.config;
    });
    builder.addCase(asyncUpdateCoreSettings.fulfilled, (state, action) => {
      state.data.coreSettings = action.payload;
    });
  },
});

export default settingsSlice.reducer;
