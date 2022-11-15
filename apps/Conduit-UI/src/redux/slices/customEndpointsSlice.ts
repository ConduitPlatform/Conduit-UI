import { createSlice } from '@reduxjs/toolkit';
import { EndpointInputs } from '../../models/database/CmsModels';
import { Assignment } from '../../models/customEndpoints/customEndpointsModels';

// TODO create proper Interface for the slices' initial state

interface ICustomEndpointSlice {
  data: {
    endpoint: {
      _id: string;
      name: string;
      operation: any;
      selectedSchema: string;
      authentication: boolean;
      paginated?: boolean;
      sorted?: boolean;
      inputs: EndpointInputs[];
      queries: [];
      assignments: Assignment[];
      enabled?: boolean;
      selectedSchemaName?: string;
      returns?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    accessibleSchemaFields: [];
    compiledSchemaFields: [];
    selectedEndpoint: any;
    endpointsWithSchemas: string[];
  };
}

const initialState: ICustomEndpointSlice = {
  data: {
    endpoint: {
      _id: '',
      name: '',
      operation: -1,
      selectedSchema: '',
      authentication: false,
      paginated: false,
      sorted: false,
      inputs: [],
      queries: [],
      assignments: [],
    },
    accessibleSchemaFields: [],
    compiledSchemaFields: [],
    selectedEndpoint: undefined,
    endpointsWithSchemas: [],
  },
};

const customEndpointsSlice = createSlice({
  name: 'customEndpoints',
  initialState,
  reducers: {
    setSelectedEndPoint(state, action) {
      state.data.selectedEndpoint = action.payload;
    },
    setAccessibleSchemaFields(state, action) {
      state.data.accessibleSchemaFields = action.payload;
    },
    setCompiledSchemaFields(state, action) {
      state.data.compiledSchemaFields = action.payload;
    },
    setEndpointData(state, action) {
      state.data.endpoint = { ...state.data.endpoint, ...action.payload };
    },
    endpointCleanSlate(state) {
      state.data = initialState.data;
    },
  },
});

export default customEndpointsSlice.reducer;
export const {
  setSelectedEndPoint,
  setAccessibleSchemaFields,
  setCompiledSchemaFields,
  setEndpointData,
  endpointCleanSlate,
} = customEndpointsSlice.actions;
