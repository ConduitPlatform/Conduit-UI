import { createSlice } from '@reduxjs/toolkit';
import { Endpoint } from '../../models/customEndpoints/customEndpointsModels';

interface ICustomEndpointSlice {
  data: {
    endpoint: Endpoint;
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
