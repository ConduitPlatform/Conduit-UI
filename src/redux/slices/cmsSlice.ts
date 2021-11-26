import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteCmsSchemaRequest,
  getCmsDocumentsByNameRequest,
  getCmsSchemasRequest,
  postCmsSchemaRequest,
  putCmsSchemaRequest,
  schemasFromOtherModules,
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
import { EndpointTypes, Schema, ToggleSchma } from '../../models/cms/CmsModels';
import { setAppDefaults, setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { Search } from '../../models/http/HttpModels';

export interface ICmsSlice {
  data: {
    schemas: Schema[];
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
    schemas: [],
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

export const asyncGetCmsSchemas = createAsyncThunk<
  { results: Schema[]; documentsCount: number },
  number
>('cms/getSchemas', async (limit = 30, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const { data } = await getCmsSchemasRequest(0, limit);
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
});

export const asyncGetMoreCmsSchemas = createAsyncThunk<
  { results: Schema[]; documentsCount: number },
  any
>('cms/getMoreSchemas', async (arg, thunkAPI: any) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const SchemaLength = thunkAPI.getState().cmsSlice.data.schemas.length;
    const { data } = await getCmsSchemasRequest(SchemaLength, 20);
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
});

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

export const asyncToggleSchema = createAsyncThunk<ToggleSchma, string>(
  'cms/toggleSchema',
  async (_id, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await toggleSchemaByIdRequest(_id);
      thunkAPI.dispatch(setAppDefaults());
      return data as ToggleSchma;
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

export const asyncDeleteSelectedSchema = createAsyncThunk<string, { _id: string }>(
  'cms/deleteSchema',
  async (args, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteCmsSchemaRequest(args._id);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully deleted schema with id: ${args}`));
      thunkAPI.dispatch(setAppDefaults());
      return args._id;
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

export const asyncGetCustomEndpoints = createAsyncThunk(
  'cms/getEndpoints',
  async (params: Search & { operation: number }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getCustomEndpointsRequest(params);
      thunkAPI.dispatch(setAppDefaults());
      return data.results as EndpointTypes[];
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUpdateCustomEndpoints = createAsyncThunk(
  'cms/updateEndpoints',
  async (params: { _id: string; endpointData: any; getEndpoints: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await editCustomEndpointsRequest(params._id, params.endpointData);
      params.getEndpoints();
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteCustomEndpoints = createAsyncThunk(
  'cms/deleteEndpoints',
  async (params: { _id: string; getEndpoints: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await deleteCustomEndpointsRequest(params._id);
      params.getEndpoints();
      return data.results;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncCreateCustomEndpoints = createAsyncThunk(
  'cms/createEndpoints',
  async (params: { endpointData: any; getEndpoints: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const body = {
        name: params.endpointData.name,
        operation: params.endpointData.operation,
        selectedSchema: params.endpointData.selectedSchema,
        authentication: params.endpointData.authentication,
        paginated: params.endpointData.paginated,
        sorted: params.endpointData.sorted,
        inputs: params.endpointData.inputs,
        query: params.endpointData.query,
        assignments: params.endpointData.assignments,
      };
      await createCustomEndpointsRequest(body);
      params.getEndpoints();
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

const findSchemaById = (_id: string, schemas: any) => {
  const found = schemas.find((s: any) => s._id === _id);
  return found ? found : null;
};

const updateSchemaStatusByName = (updated: any, schemas: any) => {
  return schemas.map((schema: any) => {
    if (schema.name === updated.name) {
      return {
        ...schema,
        enabled: updated.enabled,
      };
    } else {
      return schema;
    }
  });
};

const deleteSchemaStatusById = (deleted: any, schemas: any) => {
  return schemas.filter((schema: any) => {
    return schema._id !== deleted;
  });
};

const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {
    setSelectedSchema(state, action) {
      state.data.selectedSchema = findSchemaById(action.payload, state.data.schemas);
    },
    clearSelectedSchema(state) {
      state.data.selectedSchema = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetCmsSchemas.fulfilled, (state, action) => {
      state.data.schemas = action.payload.results;
      state.data.count = action.payload.documentsCount;
    });
    builder.addCase(asyncGetMoreCmsSchemas.fulfilled, (state, action) => {
      state.data.schemas.push(...action.payload.results);
      state.data.count = action.payload.documentsCount;
    });
    builder.addCase(asyncToggleSchema.fulfilled, (state, action) => {
      state.data.schemas = updateSchemaStatusByName(action.payload, state.data.schemas);
    });
    builder.addCase(asyncDeleteSelectedSchema.fulfilled, (state, action) => {
      state.data.schemas = deleteSchemaStatusById(action.payload, state.data.schemas);
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
