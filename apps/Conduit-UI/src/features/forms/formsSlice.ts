import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { setAppLoading } from '../../redux/slices/appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../hooks/useNotifier';
import {
  createForm,
  deleteFormsRequest,
  getFormReplies,
  getForms,
  getFormsConfig,
  updateForm,
  patchFormsConfig,
} from './FormsRequests';
import { FormReplies, IFormsConfig, FormsModel } from './FormsModels';
import { Pagination, Search, Sort } from '../../models/http/HttpModels';

export type FormsState = {
  data: {
    forms: FormsModel[];
    count: number;
    replies: FormReplies[];
    config: IFormsConfig;
  };
};

const initialState: FormsState = {
  data: {
    forms: [],
    count: 0,
    replies: [],
    config: { active: false, useAttachments: false },
  },
};

export const asyncGetForms = createAsyncThunk(
  'forms/get',
  async (params: Pagination & Search & Sort, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getForms(params);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(
        enqueueErrorNotification(`Could not get forms data:${getErrorData(error)}`)
      );
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

export const asyncCreateForm = createAsyncThunk(
  'forms/create',
  async (formData: FormsModel, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await createForm(formData);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(asyncGetForms({ skip: 0, limit: 10 }));
      thunkAPI.dispatch(
        enqueueSuccessNotification(`Successfully created the form ${formData.name}!`)
      );
    } catch (error) {
      thunkAPI.dispatch(
        enqueueErrorNotification(`Could not create a new form:${getErrorData(error)}`)
      );
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

export const asyncEditForm = createAsyncThunk(
  'forms/edit',
  async (args: { _id: string; data: FormsModel }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await updateForm(args._id, args.data);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(
        enqueueSuccessNotification(`Successfully edited the form ${args.data.name}!`)
      );
      return { id: args._id, data: args.data };
    } catch (error) {
      thunkAPI.dispatch(enqueueErrorNotification(`Could not update form:${getErrorData(error)}`));
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

export const asyncDeleteForms = createAsyncThunk(
  'forms/deleteMultiple',
  async (params: { ids: string[]; getForms: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteFormsRequest(params.ids);
      params.getForms();
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully deleted forms!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetFormReplies = createAsyncThunk(
  'forms/replies',
  async (args: { id: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getFormReplies(args.id);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(
        enqueueErrorNotification(`Could not get form replies:${getErrorData(error)}`)
      );
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

export const asyncGetFormsConfig = createAsyncThunk('formsConfig/get', async (args, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const {
      data: { config },
    } = await getFormsConfig();
    thunkAPI.dispatch(setAppLoading(false));
    return config;
  } catch (error) {
    thunkAPI.dispatch(
      enqueueErrorNotification(`Could not get the forms config:${getErrorData(error)}`)
    );
    thunkAPI.dispatch(setAppLoading(false));
    throw error;
  }
});

export const asyncEditFormsConfig = createAsyncThunk(
  'formsConfig/edit',
  async (config: IFormsConfig, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await patchFormsConfig(config);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Forms config successfully updated`));
      return data.config;
    } catch (error) {
      thunkAPI.dispatch(
        enqueueErrorNotification(`Could not update the config:${getErrorData(error)}`)
      );
      thunkAPI.dispatch(setAppLoading(false));
      throw error;
    }
  }
);

const updateFormById = (updated: FormsModel, forms: FormsModel[]) => {
  return forms.map((f) => {
    if (f._id === updated._id) {
      return {
        ...updated,
      };
    } else {
      return f;
    }
  });
};

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(asyncGetForms.fulfilled, (state, action) => {
      state.data.forms = action.payload.forms;
      state.data.count = action.payload.count;
    });

    builder.addCase(asyncEditForm.fulfilled, (state, action) => {
      state.data.forms = updateFormById(action.payload.data, state.data.forms);
    });
    builder.addCase(asyncGetFormReplies.fulfilled, (state, action) => {
      state.data.replies = action.payload;
    });
    builder.addCase(asyncGetFormsConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncEditFormsConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
  },
});

export default formsSlice.reducer;
