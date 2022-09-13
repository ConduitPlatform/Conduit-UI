import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteSchemasRequest,
  getDocumentByIdRequest,
  getDocumentsByNameRequest,
  getSchemasRequest,
  postSchemaRequest,
  patchSchemaRequest,
  toggleMultipleSchemasRequest,
  toggleSchemaByIdRequest,
  setSchemaExtension,
  getSchemaOwners,
  getSchemaByIdRequest,
} from '../../http/requests/DatabaseRequests';
import {
  createSchemaDocumentRequest,
  deleteSchemaDocumentRequest,
  editSchemaDocumentRequest,
} from '../../http/requests/SchemasRequests';
import {
  createCustomEndpointsRequest,
  deleteCustomEndpointsRequest,
  editCustomEndpointsRequest,
  getCustomEndpointsRequest,
  getSchemasWithEndpoints,
} from '../../http/requests/CustomEndpointsRequests';
import { EndpointTypes, IntrospectionStatus, Schema } from '../../models/database/CmsModels';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { Pagination, Search } from '../../models/http/HttpModels';
import { set } from 'lodash';
import {
  finalizeIntrospectedSchemas,
  getIntrospectionSchemaById,
  getIntrospectionSchemas,
  introspect,
  introspectionStatus,
} from '../../http/requests/IntrospectionRequests';

export interface IDatabaseSlice {
  data: {
    schemas: {
      schemaDocuments: Schema[];
      schemasCount: number;
    };
    introspectionSchemas: {
      schemaDocuments: Schema[];
      schemasCount: number;
    };
    schemaToEdit: Schema | null;
    introspectionSchemaToEdit: Schema | null;
    dialogSchemas: {
      schemas: Schema[];
      schemasCount: number;
    };
    documents: {
      documents: any;
      documentsCount: number;
    };
    schemasWithEndpoints: Schema[];
    customEndpoints: {
      endpoints: EndpointTypes[];
      count: number;
      filters: {
        search: string;
        operation: number;
      };
    };
    schemaOwners: [];
    count: number;
    config: any;
    selectedSchema: Schema | null;
    introspectionStatus: IntrospectionStatus;
  };
}

const initialState: IDatabaseSlice = {
  data: {
    schemas: {
      schemaDocuments: [],
      schemasCount: 0,
    },
    schemaToEdit: null,
    introspectionSchemas: {
      schemaDocuments: [],
      schemasCount: 0,
    },
    introspectionSchemaToEdit: null,
    dialogSchemas: {
      schemas: [],
      schemasCount: 0,
    },
    documents: {
      documents: [],
      documentsCount: 0,
    },
    schemasWithEndpoints: [],
    customEndpoints: {
      endpoints: [],
      count: 0,
      filters: {
        search: '',
        operation: -2,
      },
    },
    schemaOwners: [],
    count: 0,
    config: null,
    selectedSchema: null,
    introspectionStatus: {
      foreignSchemaCount: 0,
      foreignSchemas: [],
      importedSchemaCount: 0,
      importedSchemas: [],
    },
  },
};

export const asyncGetSchemas = createAsyncThunk(
  'database/getSchemas',
  async (params: Pagination & Search & { enabled?: boolean } & { owner?: string[] }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getSchemasRequest(params);
      thunkAPI.dispatch(setAppLoading(false));
      return {
        results: data.schemas as Schema[],
        documentsCount: data.count as number,
      };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetSchemaById = createAsyncThunk(
  'database/getSchemaById',
  async (params: { id: string | string[]; noError?: boolean }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getSchemaByIdRequest(params.id);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      if (!params.noError) thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncAddSchemas = createAsyncThunk(
  'database/addSchemas',
  async (params: Pagination & Search & { enabled?: boolean } & { owner?: string[] }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getSchemasRequest(params);
      thunkAPI.dispatch(setAppLoading(false));
      return {
        results: data.schemas as Schema[],
      };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetSchemaOwners = createAsyncThunk(
  'database/getSchemaOwners',
  async (param, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getSchemaOwners();
      thunkAPI.dispatch(setAppLoading(false));
      return {
        owners: data.modules,
      };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetSchemasDialog = createAsyncThunk(
  'database/getSchemasDialog',
  async (params: Pagination & Search & { enabled?: boolean } & { owner: string[] }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getSchemasRequest(params);
      thunkAPI.dispatch(setAppLoading(false));
      return {
        dialogResults: data.schemas as Schema[],
        dialogDocumentsCount: data.count as number,
      };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncCreateNewSchema = createAsyncThunk<Schema, any>(
  'database/createNewSchema',
  async (dataForSchema, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await postSchemaRequest(dataForSchema);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully created ${dataForSchema.name}`));
      thunkAPI.dispatch(setAppLoading(false));
      return data as Schema;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncToggleSchema = createAsyncThunk(
  'database/toggleSchema',
  async (_id: string, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await toggleSchemaByIdRequest(_id);
      thunkAPI.dispatch(setAppLoading(false));
      return _id;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncToggleMultipleSchemas = createAsyncThunk(
  'database/toggleMultiple',
  async (params: { ids: string[]; enabled: boolean }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await toggleMultipleSchemasRequest(params);
      thunkAPI.dispatch(
        enqueueSuccessNotification(
          `Successfully ${!params.enabled ? 'archived' : 'enabled'} selected schemas`
        )
      );
      thunkAPI.dispatch(setAppLoading(false));
      return params;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncEditSchema = createAsyncThunk<any, { _id: string; data: any }>(
  'database/editSchema',
  async (params, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await patchSchemaRequest(params._id, params.data);
      thunkAPI.dispatch(
        enqueueSuccessNotification(`Successfully edited schema [id]:${params._id}`)
      );
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteSelectedSchemas = createAsyncThunk(
  'database/deleteSchema',
  async (args: { ids: string[]; deleteData: boolean }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteSchemasRequest(args);
      if (args.ids.length > 1) {
        thunkAPI.dispatch(enqueueSuccessNotification(`Successfully deleted selected schemas`));
      } else {
        thunkAPI.dispatch(
          enqueueSuccessNotification(`Successfully deleted schema with id: ${args.ids[0]}`)
        );
      }
      thunkAPI.dispatch(setAppLoading(false));
      return args.ids;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncModifyExtension = createAsyncThunk<any, { _id: string; data: any }>(
  'database/modifyExtension',
  async (params, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await setSchemaExtension(params._id, params.data);
      thunkAPI.dispatch(
        enqueueSuccessNotification(`Successfully edited schema [id]:${params._id}`)
      );
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetSchemaDocuments = createAsyncThunk(
  'database/getDocs',
  async (params: { name: string; skip: number; limit: number; query: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getDocumentsByNameRequest(params);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetSchemaDocument = createAsyncThunk(
  'database/getDoc',
  async (
    params: {
      schemaName: string;
      id: string;
      path: string[];
      documentId: string;
    },
    thunkAPI
  ) => {
    try {
      const { data } = await getDocumentByIdRequest(params);
      return {
        document: data,
        path: params.path,
        documentId: params.documentId,
      };
    } catch (error) {
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncCreateSchemaDocument = createAsyncThunk<
  any,
  { schemaName: string; document: any; getSchemaDocuments: () => void }
>('database/createDoc', async (params, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const body = { schemaName: params.schemaName, inputDocument: params.document };
    await createSchemaDocumentRequest(params.schemaName, body);
    thunkAPI.dispatch(setAppLoading(false));
    params.getSchemaDocuments();
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncDeleteSchemaDocument = createAsyncThunk<
  any,
  { schemaName: string; documentId: string; getSchemaDocuments: () => void }
>('database/deleteDoc', async (params, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    await deleteSchemaDocumentRequest(params.schemaName, params.documentId);
    params.getSchemaDocuments();
    thunkAPI.dispatch(setAppLoading(false));
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncEditSchemaDocument = createAsyncThunk(
  'database/editDoc',
  async (
    params: {
      schemaName: string;
      documentData: any;
      getSchemaDocuments: () => void;
      onEditError: () => void;
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await editSchemaDocumentRequest(
        params.schemaName,
        params.documentData._id,
        params.documentData
      );
      thunkAPI.dispatch(setAppLoading(false));
      params.getSchemaDocuments();
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      params.onEditError();
      throw error;
    }
  }
);

export const asyncSetCustomEndpoints = createAsyncThunk(
  'database/setEndpoints',
  async (
    params: Pagination & Search & { schemaName?: string[] } & { operation?: number },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { customEndpoints, count },
      } = await getCustomEndpointsRequest(params);
      thunkAPI.dispatch(setAppLoading(false));
      return { endpoints: customEndpoints as EndpointTypes[], count: count };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncAddCustomEndpoints = createAsyncThunk(
  'database/addEndpoints',
  async (
    params: Pagination & Search & { schemaName?: string[] } & { operation?: number },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { customEndpoints },
      } = await getCustomEndpointsRequest(params);
      thunkAPI.dispatch(setAppLoading(false));

      return { endpoints: customEndpoints as EndpointTypes[] };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUpdateCustomEndpoints = createAsyncThunk(
  'database/updateEndpoints',
  async (params: { _id: string; endpointData: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await editCustomEndpointsRequest(params._id, params.endpointData);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(
        enqueueSuccessNotification(`Endpoint ${params.endpointData.name} edited! `)
      );
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteCustomEndpoints = createAsyncThunk(
  'database/deleteEndpoints',
  async (params: { _id: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteCustomEndpointsRequest(params._id);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Endpoint deleted! `));
      return params._id;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncCreateCustomEndpoints = createAsyncThunk(
  'database/createEndpoints',
  async (
    params: {
      endpointData: any;
      filters: { search: string; operation: number };
      endpointsLength: number;
    },
    thunkAPI
  ) => {
    thunkAPI.dispatch(setAppLoading(true));
    const data = params.endpointData;
    try {
      const body = {
        name: data.name,
        operation: data.operation,
        selectedSchema: data.selectedSchema,
        authentication: data.authentication,
        paginated: data.paginated,
        sorted: data.sorted,
        inputs: data.inputs,
        query: data.query,
        assignments: data.assignments,
      };
      await createCustomEndpointsRequest(body);
      const getEndpointsParams = {
        skip: 0,
        limit: params.endpointsLength,
        search: params.filters.search,
        operation: params.filters.operation !== -2 ? params.filters.operation : undefined,
      };
      thunkAPI.dispatch(asyncSetCustomEndpoints(getEndpointsParams));
      thunkAPI.dispatch(
        enqueueSuccessNotification(`Endpoint ${params.endpointData.name} created! `)
      );
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetSchemasWithEndpoints = createAsyncThunk(
  'database/getSchemasWithEndpoints',
  async (param, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getSchemasWithEndpoints();

      thunkAPI.dispatch(setAppLoading(false));
      return data.schemas;
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

export const asyncGetIntrospectionSchemas = createAsyncThunk(
  'database/getIntrospectionSchemas',
  async (params: Pagination & Search, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getIntrospectionSchemas(params);

      thunkAPI.dispatch(setAppLoading(false));

      return {
        results: data.schemas as Schema[],
        documentsCount: data.count as number,
      };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetIntrospectionSchemaById = createAsyncThunk(
  'database/getIntrospectionSchemaById',
  async (params: { id: string | string[] }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getIntrospectionSchemaById(params.id);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncAddIntroSpectionSchemas = createAsyncThunk(
  'database/addIntrospectionSchemas',
  async (params: Pagination & Search, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await getIntrospectionSchemas(params);
      thunkAPI.dispatch(setAppLoading(false));
      return {
        results: data.schemas as Schema[],
      };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncFinalizeIntrospectedSchema = createAsyncThunk(
  'database/finalizeIntrospection',
  async (params: any[], thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await finalizeIntrospectedSchemas(params);
      thunkAPI.dispatch(setAppLoading(false));
      return {
        results: data.schemas as Schema[],
      };
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncIntrospect = createAsyncThunk('database/introspect', async (params, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    await introspect();

    const params = {
      skip: 0,
      limit: 25,
      search: '',
    };

    thunkAPI.dispatch(asyncGetIntrospectionSchemas(params));
    thunkAPI.dispatch(setAppLoading(false));
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncGetIntrospectionStatus = createAsyncThunk(
  'database/intospectionStatus',
  async (params, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await introspectionStatus();
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    setSelectedSchema(state, action) {
      state.data.selectedSchema = findSchemaById(
        action.payload,
        state.data.schemas.schemaDocuments
      );
    },
    clearSelectedSchema(state) {
      state.data.schemaToEdit = null;
    },
    clearIntrospectionSchema(state) {
      state.data.introspectionSchemaToEdit = null;
    },
    clearEndpoints(state) {
      state.data.customEndpoints.endpoints = [];
    },
    setEndpointsSearch(state, action) {
      state.data.customEndpoints.filters.search = action.payload;
    },
    setEndpointsOperation(state, action) {
      state.data.customEndpoints.filters.operation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetSchemas.fulfilled, (state, action) => {
      state.data.schemas.schemaDocuments = action.payload.results;
      state.data.schemas.schemasCount = action.payload.documentsCount;
    });
    builder.addCase(asyncAddSchemas.fulfilled, (state, action) => {
      state.data.schemas.schemaDocuments = [
        ...state.data.schemas.schemaDocuments,
        ...action.payload.results,
      ];
    });
    builder.addCase(asyncGetSchemaById.fulfilled, (state, action) => {
      state.data.schemaToEdit = action.payload;
    });
    builder.addCase(asyncGetSchemasDialog.fulfilled, (state, action) => {
      state.data.dialogSchemas.schemas = action.payload.dialogResults;
      state.data.dialogSchemas.schemasCount = action.payload.dialogDocumentsCount;
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
          schema.modelOptions.conduit.cms.enabled !== action.payload.enabled &&
          !action.payload.ids.includes(schema._id)
      );
      state.data.schemas.schemasCount = state.data.schemas.schemasCount - action.payload.ids.length;
    });
    builder.addCase(asyncDeleteSelectedSchemas.fulfilled, (state, action) => {
      state.data.schemas.schemaDocuments = state.data.schemas.schemaDocuments.filter(
        (schema) => !action.payload.includes(schema._id)
      );
    });
    builder.addCase(asyncGetSchemaDocuments.fulfilled, (state, action) => {
      state.data.documents.documents = action.payload.documents;
      state.data.documents.documentsCount = action.payload.count;
    });
    builder.addCase(asyncGetSchemaDocument.fulfilled, (state, action) => {
      const documentIndex = state.data.documents.documents.findIndex(
        (document: any) => document._id === action.payload.documentId
      );
      const selectedDocument = state.data.documents.documents[documentIndex];
      set(selectedDocument, action.payload.path, action.payload.document.result);
    });
    builder.addCase(asyncSetCustomEndpoints.fulfilled, (state, action) => {
      state.data.customEndpoints.endpoints = action.payload.endpoints;
      state.data.customEndpoints.count = action.payload.count;
    });
    builder.addCase(asyncAddCustomEndpoints.fulfilled, (state, action) => {
      state.data.customEndpoints.endpoints = [
        ...state.data.customEndpoints.endpoints,
        ...action.payload.endpoints,
      ];
    });
    builder.addCase(asyncDeleteCustomEndpoints.fulfilled, (state, action) => {
      state.data.customEndpoints.endpoints = state.data.customEndpoints.endpoints.filter(
        (endpoint) => endpoint._id !== action.payload
      );
      state.data.customEndpoints.count = state.data.customEndpoints.count - 1;
    });
    builder.addCase(asyncGetSchemaOwners.fulfilled, (state, action) => {
      state.data.schemaOwners = action.payload.owners;
    });
    builder.addCase(asyncGetSchemasWithEndpoints.fulfilled, (state, action) => {
      state.data.schemasWithEndpoints = action.payload;
    });
    builder.addCase(asyncGetIntrospectionSchemas.fulfilled, (state, action) => {
      state.data.introspectionSchemas.schemaDocuments = action.payload.results;
      state.data.introspectionSchemas.schemasCount = action.payload.documentsCount;
    });
    builder.addCase(asyncGetIntrospectionSchemaById.fulfilled, (state, action) => {
      state.data.introspectionSchemaToEdit = action.payload;
    });
    builder.addCase(asyncGetIntrospectionStatus.fulfilled, (state, action) => {
      state.data.introspectionStatus = action.payload;
    });
    builder.addCase(asyncAddIntroSpectionSchemas.fulfilled, (state, action) => {
      state.data.introspectionSchemas.schemaDocuments = [
        ...state.data.introspectionSchemas.schemaDocuments,
        ...action.payload.results,
      ];
    });
  },
});

export default databaseSlice.reducer;
export const {
  setSelectedSchema,
  clearSelectedSchema,
  clearIntrospectionSchema,
  setEndpointsSearch,
  setEndpointsOperation,
} = databaseSlice.actions;
