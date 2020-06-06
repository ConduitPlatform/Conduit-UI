//CMS schemas actions
import {
  CLEAR_CMS_SELECTED_SCHEMA, CLEAR_SELECTED_SCHEMA,
  DELETE_CMS_SCHEMAS,
  SET_CMS_ERROR,
  SET_CMS_SCHEMA_DOCUMENTS,
  SET_CMS_SCHEMAS,
  SET_SELECTED_SCHEMA,
  START_CMS_LOADING,
  STOP_CMS_LOADING,
  UPDATE_SCHEMAS_STATUS,
} from './actionTypes';

export const setCmsSchemas = (data) => ({
  type: SET_CMS_SCHEMAS,
  payload: data,
});

export const startCmsLoading = () => ({
  type: START_CMS_LOADING,
});

export const stopCmsLoading = () => ({
  type: STOP_CMS_LOADING,
});

export const setCmsError = (error) => ({
  type: SET_CMS_ERROR,
  payload: { error },
});

export const setSelectedSchema = (_id) => ({
  type: SET_SELECTED_SCHEMA,
  payload: _id,
});

export const updateSchemaStatus = (data) => ({
  type: UPDATE_SCHEMAS_STATUS,
  payload: data,
});

export const deletedSchemaById = (data) => ({
  type: DELETE_CMS_SCHEMAS,
  payload: data,
});

export const setSchemaDocumentsByName = (data) => ({
  type: SET_CMS_SCHEMA_DOCUMENTS,
  payload: data,
});

export const clearSelectedSchema = () => ({
  type: CLEAR_SELECTED_SCHEMA,
});
