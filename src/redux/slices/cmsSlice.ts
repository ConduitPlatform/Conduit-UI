import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteCmsSchemasRequest,
  getCmsDocumentsByNameRequest,
  getCmsSchemasRequest,
  postCmsSchemaRequest,
  putCmsSchemaRequest,
  schemasFromOtherModules,
  toggleMultipleSchemasRequest,
  toggleSchemaByIdRequest,
} from '../../http/CmsRequests';
import {
  createSchemaDocumentRequest,
  editSchemaDocumentRequest,
  deleteSchemaDocumentRequest,
} from '../../http/SchemasRequests';
import {
  getCustomEndpointsRequest,
  createCustomEndpointsRequest,
  editCustomEndpointsRequest,
  deleteCustomEndpointsRequest,
} from '../../http/CustomEndpointsRequests';
import { EndpointTypes, Schema } from '../../models/cms/CmsModels';
import { setAppDefaults, setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { Pagination, Search, Sort } from '../../models/http/HttpModels';

export interface ICmsSlice {
  data: {
    schemas: {
      schemaDocuments: Schema[];
      schemasCount: number;
    };
    schemasFromOtherModules: Schema[];
    documents: {
      documents: any;
      documentsCount: number;
    };
    customEndpoints: EndpointTypes[];
    count: number;
    config: any;
    selectedSchema: Schema | null;
  };
}

const initialState: ICmsSlice = {
  data: {
    schemas: {
      schemaDocuments: [],
      schemasCount: 0,
    },
    schemasFromOtherModules: [],
    documents: {
      documents: [],
      documentsCount: 0,
    },
    customEndpoints: [],
    count: 0,
    config: null,
    selectedSchema: null,
  },
};

export const asyncGetCmsSchemas = createAsyncThunk(
  'cms/getSchemas',
  async (params: Pagination & Search & Sort & { enabled?: boolean }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getCmsSchemasRequest(params);
      thunkAPI.dispatch(setAppDefaults());
      return {
        results: data.results as Schema[],
        documentsCount: data.documentsCount as number,
      };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncCreateNewSchema = createAsyncThunk<Schema, any>(
  'cms/createNewSchema',
  async (dataForSchema, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await postCmsSchemaRequest(dataForSchema);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully created ${dataForSchema.name}`));
      thunkAPI.dispatch(setAppDefaults());
      return data as Schema;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncToggleSchema = createAsyncThunk(
  'cms/toggleSchema',
  async (_id: string, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await toggleSchemaByIdRequest(_id);
      thunkAPI.dispatch(setAppDefaults());
      return _id;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncToggleMultipleSchemas = createAsyncThunk(
  'cms/toggleMultiple',
  async (params: { ids: string[]; enabled: boolean }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await toggleMultipleSchemasRequest(params);
      thunkAPI.dispatch(
        enqueueSuccessNotification(
          `Successfully ${!params.enabled ? 'archived' : 'enabled'} selected schemas`
        )
      );
      thunkAPI.dispatch(setAppDefaults());
      return params;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncEditSchema = createAsyncThunk<any, { _id: string; data: any }>(
  'cms/editSchema',
  async (params, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await putCmsSchemaRequest(params._id, params.data);
      thunkAPI.dispatch(
        enqueueSuccessNotification(`Successfully edited schema [id]:${params._id}`)
      );
      thunkAPI.dispatch(setAppDefaults());
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteSelectedSchemas = createAsyncThunk(
  'cms/deleteSchema',
  async (args: { ids: string[]; deleteData: boolean }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteCmsSchemasRequest(args);
      if (args.ids.length > 1) {
        thunkAPI.dispatch(enqueueSuccessNotification(`Successfully deleted selected schemas`));
      } else {
        thunkAPI.dispatch(
          enqueueSuccessNotification(`Successfully deleted schema with id: ${args.ids[0]}`)
        );
      }

      thunkAPI.dispatch(setAppDefaults());
      return args.ids;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetSchemaDocuments = createAsyncThunk<any, string>(
  'cms/getDocs',
  async (name, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getCmsDocumentsByNameRequest(name);
      thunkAPI.dispatch(setAppDefaults());
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetMoreSchemaDocuments = createAsyncThunk<any, { name: string; skip: number }>(
  'cms/getMoreDocs',
  async (params, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getCmsDocumentsByNameRequest(params.name, params.skip, 20);
      thunkAPI.dispatch(setAppDefaults());
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const prepareDocumentField = (doc: any) => {
  const field = { [doc.name]: null };
  if (doc.fields) {
    doc.fields.forEach((subField: any) => {
      const tempObj = field[doc.name];
      const preppedFields = prepareDocumentField(subField);
      field[doc.name] = Object.assign({ tempObj, ...preppedFields });
    });
  } else {
    field[doc.name] = doc.value;
  }
  return field;
};

export const asyncCreateSchemaDocument = createAsyncThunk<
  any,
  { schemaName: string; document: any }
>('cms/createDoc', async (params, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const body = { schemaName: params.schemaName, inputDocument: {} };
    params.document.forEach((d: any) => {
      const field = prepareDocumentField(d);
      body.inputDocument = { ...body.inputDocument, ...field };
    });
    await createSchemaDocumentRequest(params.schemaName, body);
    thunkAPI.dispatch(asyncGetSchemaDocuments(params.schemaName));
    return;
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncDeleteSchemaDocument = createAsyncThunk<
  any,
  { schemaName: string; documentId: string }
>('cms/deleteDoc', async (params, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    await deleteSchemaDocumentRequest(params.schemaName, params.documentId);
    thunkAPI.dispatch(asyncGetSchemaDocuments(params.schemaName));
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncEditSchemaDocument = createAsyncThunk(
  'cms/editDoc',
  async (params: { schemaName: string; documentId: string; documentData: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const body = {
        schemaName: params.schemaName,
        id: params.documentId,
        changedDocument: {},
      };

      params.documentData.forEach((d: any) => {
        const field = prepareDocumentField(d);
        body.changedDocument = { ...body.changedDocument, ...field };
      });

      await editSchemaDocumentRequest(params.schemaName, params.documentId, body);
      thunkAPI.dispatch(asyncGetSchemaDocuments(params.schemaName));
      return params.schemaName;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetCustomEndpoints = createAsyncThunk<EndpointTypes[], any>(
  'cms/getEndpoints',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getCustomEndpointsRequest();
      thunkAPI.dispatch(setAppDefaults());
      return data.results as EndpointTypes[];
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUpdateCustomEndpoints = createAsyncThunk<any, { _id: string; endpointData: any }>(
  'cms/updateEndpoints',
  async (params, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await editCustomEndpointsRequest(params._id, params.endpointData);
      thunkAPI.dispatch(asyncGetCustomEndpoints(''));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteCustomEndpoints = createAsyncThunk<any, string>(
  'cms/deleteEndpoints',
  async (_id, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await deleteCustomEndpointsRequest(_id);
      thunkAPI.dispatch(asyncGetCustomEndpoints(''));

      return data.results;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncCreateCustomEndpoints = createAsyncThunk<any, any>(
  'cms/createEndpoints',
  async (endPointData, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const body = {
        name: endPointData.name,
        operation: endPointData.operation,
        selectedSchema: endPointData.selectedSchema,
        authentication: endPointData.authentication,
        paginated: endPointData.paginated,
        sorted: endPointData.sorted,
        inputs: endPointData.inputs,
        query: endPointData.query,
        assignments: endPointData.assignments,
      };
      await createCustomEndpointsRequest(body);
      thunkAPI.dispatch(asyncGetCustomEndpoints(''));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncFetchSchemasFromOtherModules = createAsyncThunk<any, any>(
  'cms/schemasFromOtherModules',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await schemasFromOtherModules();
      thunkAPI.dispatch(setAppDefaults());
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const findSchemaById = (_id: string, schemaDocuments: Schema[]) => {
  const found = schemaDocuments.find((s) => s._id === _id);
  return found ? found : null;
};

const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {
    setSelectedSchema(state, action) {
      state.data.selectedSchema = findSchemaById(
        action.payload,
        state.data.schemas.schemaDocuments
      );
    },
    clearSelectedSchema(state) {
      state.data.selectedSchema = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetCmsSchemas.fulfilled, (state, action) => {
      state.data.schemas.schemaDocuments = action.payload.results;
      state.data.schemas.schemasCount = action.payload.documentsCount;
    });
    builder.addCase(asyncToggleSchema.fulfilled, (state, action) => {
      state.data.schemas.schemaDocuments = state.data.schemas.schemaDocuments.filter(
        (schema) => schema._id !== action.payload
      );
      state.data.schemas.schemasCount = state.data.schemas.schemasCount - 1;
    });
    builder.addCase(asyncToggleMultipleSchemas.fulfilled, (state, action) => {
      state.data.schemas.schemaDocuments = state.data.schemas.schemaDocuments.filter(
        (schema) =>
          schema.enabled !== action.payload.enabled && !action.payload.ids.includes(schema._id)
      );
      state.data.schemas.schemasCount = state.data.schemas.schemasCount - action.payload.ids.length;
    });
    builder.addCase(asyncDeleteSelectedSchemas.fulfilled, (state, action) => {
      state.data.schemas.schemaDocuments = state.data.schemas.schemaDocuments.filter(
        (schema) => !action.payload.includes(schema._id)
      );
    });
    builder.addCase(asyncGetSchemaDocuments.fulfilled, (state, action) => {
      state.data.documents = action.payload;
    });
    builder.addCase(asyncGetMoreSchemaDocuments.fulfilled, (state, action) => {
      state.data.documents.documents.push(...action.payload.documents);
    });
    builder.addCase(asyncGetCustomEndpoints.fulfilled, (state, action) => {
      state.data.customEndpoints = action.payload;
    });
    builder.addCase(asyncFetchSchemasFromOtherModules.fulfilled, (state, action) => {
      state.data.schemasFromOtherModules = action.payload.results;
    });
  },
});

export default cmsSlice.reducer;
export const { setSelectedSchema, clearSelectedSchema } = cmsSlice.actions;
