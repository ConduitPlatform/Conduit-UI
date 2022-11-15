import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
  Icon,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Delete, Edit, InfoOutlined, Search } from '@mui/icons-material';
import {
  findFieldsWithTypes,
  getCompiledFieldsOfSchema,
  hasInvalidAssignments,
  hasInvalidInputs,
  hasInvalidQueries,
  prepareQuery,
} from '../../../utils/cms';
import { OperationsEnum } from '../../../models/OperationsEnum';
import {
  ConduitMultiSelect,
  ConduitTooltip,
  ConfirmationDialog,
} from '@conduitplatform/ui-components';
import OperationSection from './OperationSection';
import SaveSection from './SaveSection';
import QueriesSection from './QueriesSection';
import AssignmentsSection from './AssignmentsSection';
import InputsSection from './InputsSection';
import { v4 as uuidv4 } from 'uuid';
import {
  endpointCleanSlate,
  setAccessibleSchemaFields,
  setCompiledSchemaFields,
  setEndpointData,
  setSelectedEndPoint,
} from '../../../redux/slices/customEndpointsSlice';
import { Schema } from '../../../models/database/CmsModels';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import {
  asyncCreateCustomEndpoints,
  asyncDeleteCustomEndpoints,
  asyncGetSchemasWithEndpoints,
  asyncUpdateCustomEndpoints,
  setEndpointsOperation,
  setEndpointsSearch,
} from '../../../redux/slices/databaseSlice';
import InfiniteScrollLayout from '../../InfiniteScrollLayout';
import { useRouter } from 'next/router';
import useDebounce from '../../../hooks/useDebounce';
import { enqueueInfoNotification } from '../../../utils/useNotifier';
import EndpointsList from './EndpointsList';
import { getAccesssibleSchemaFields } from '../../../http/requests/DatabaseRequests';
import InformationTooltip from './InformationTooltip';

const CustomEndpointsLayout: FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const router = useRouter();
  const { schema } = router.query;

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [search, setSearch] = useState('');
  const [schemas, setSchemas] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  const { endpoint, selectedEndpoint } = useAppSelector((state) => state.customEndpointsSlice.data);
  const { schemasWithEndpoints } = useAppSelector((state) => state.databaseSlice.data);
  const { filters } = useAppSelector((state) => state.databaseSlice.data.customEndpoints);
  const { endpoints } = useAppSelector((state) => state.databaseSlice.data.customEndpoints);
  const {
    schemas: { schemaDocuments },
  } = useAppSelector((state) => state.databaseSlice.data);

  useEffect(() => {
    dispatch(setEndpointsSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    dispatch(asyncGetSchemasWithEndpoints());
  }, [dispatch]);

  useEffect(() => {
    if (schema) {
      const isFound = schemasWithEndpoints.some((element: Schema) => {
        if (element.name === schema) {
          return true;
        }
      });
      if (!isFound) {
        router.replace('/database/custom', undefined, { shallow: true });
        dispatch(
          enqueueInfoNotification('Selected schema has no available endpoints!', 'duplicate')
        );
      } else {
        setSchemas([`${schema}`]);
      }
    }
  }, [schema, dispatch, router, schemasWithEndpoints]);

  const handleListItemSelect = (endpoint: any) => {
    dispatch(setSelectedEndPoint(endpoint));
    dispatch(setEndpointData({ ...endpoint }));
    setCreateMode(false);
  };

  const handleAddNewEndpoint = () => {
    dispatch(endpointCleanSlate());
    setEditMode(true);
    setCreateMode(true);
  };

  const handleFilterChange = (event: any) => {
    setSchemas(event.target.value);
    if (schema) {
      router.replace('/database/custom', undefined, { shallow: true });
    }
  };

  const initializeData = useCallback(async () => {
    if (selectedEndpoint) {
      const fields = getCompiledFieldsOfSchema(selectedEndpoint.selectedSchema, schemaDocuments);

      const {
        data: { accessibleFields },
      } = await getAccesssibleSchemaFields(
        selectedEndpoint.selectedSchema,
        selectedEndpoint.operation
      );

      const accessibleFieldsWithTypes = findFieldsWithTypes(accessibleFields);

      let inputs = [];
      const queryGroup: any = [];
      let assignments = [];
      let fieldsWithTypes = [];
      if (fields) {
        fieldsWithTypes = findFieldsWithTypes(fields);
      }

      if (selectedEndpoint.query) {
        const query = selectedEndpoint.query;

        const keys = Object.keys(query);
        keys.forEach((k) => {
          const nodeLevel1 = query[k];
          const nodeLevel1Queries = nodeLevel1.map((q: any) => {
            const keys = Object.keys(q);
            const isOperator = keys.includes('AND') || keys.includes('OR');
            if (isOperator) {
              return { _id: uuidv4(), operator: keys[0], queries: q[keys[0]] };
            } else {
              return { _id: uuidv4(), ...q };
            }
          });

          const lvl2Node = nodeLevel1Queries.find((q: any) => 'operator' in q);
          if (lvl2Node) {
            const nodeLevel2Queries = lvl2Node.queries.map((q: any) => {
              const keys = Object.keys(q);
              const isOperator = keys.includes('AND') || keys.includes('OR');
              if (isOperator) {
                return { _id: uuidv4(), operator: keys[0], queries: q[keys[0]] };
              } else {
                return { _id: uuidv4(), ...q };
              }
            });
            lvl2Node.queries = [...nodeLevel2Queries];

            const lvl3Node = nodeLevel2Queries.find((q: any) => 'operator' in q);
            if (lvl3Node) {
              const nodeLevel3Queries = lvl3Node.queries.map((q: any) => ({
                _id: uuidv4(),
                ...q,
              }));
              lvl3Node.queries = [...nodeLevel3Queries];
            }
          }
          queryGroup.push({
            _id: uuidv4(),
            operator: k,
            queries: [...nodeLevel1Queries],
          });
        });
      }

      if (selectedEndpoint.assignments) {
        assignments = selectedEndpoint.assignments.map((q: any) => ({ ...q }));
      }
      if (selectedEndpoint.inputs) {
        inputs = selectedEndpoint.inputs.map((i: any) => ({ ...i }));
      }

      dispatch(
        setEndpointData({
          queries: queryGroup,
          inputs,
          assignments,
        })
      );

      dispatch(setCompiledSchemaFields(fieldsWithTypes));
      dispatch(setAccessibleSchemaFields(accessibleFieldsWithTypes));
    }
  }, [dispatch, schemaDocuments, selectedEndpoint]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const handleConfirmationDialogClose = () => {
    setConfirmationOpen(false);
  };

  const handleDeleteClick = () => {
    setConfirmationOpen(true);
  };

  const handleEditClick = () => {
    setEditMode(true);
    setCreateMode(false);
  };

  const handleSubmit = (edit = false) => {
    const schemaToSubmit = schemaDocuments.find(
      (schemaDocument: Schema) => schemaDocument._id === endpoint.selectedSchema
    );

    const query = prepareQuery(endpoint.queries);

    const data = {
      name: endpoint.name,
      operation: Number(endpoint.operation),
      selectedSchema: schemaToSubmit?._id,
      authentication: endpoint.authentication,
      paginated: endpoint.paginated,
      sorted: endpoint.sorted,
      inputs: endpoint.inputs,
      query,
      assignments: endpoint.assignments,
    };

    if (edit) {
      const _id = selectedEndpoint._id;
      dispatch(asyncUpdateCustomEndpoints({ _id, endpointData: data }));
      dispatch(setSelectedEndPoint(''));
    } else {
      dispatch(
        asyncCreateCustomEndpoints({
          endpointData: data,
          filters,
          endpointsLength: endpoints.length,
        })
      );
      dispatch(setSelectedEndPoint(''));
    }
    setCreateMode(false);
    setEditMode(false);
  };

  const handleCancelClick = () => {
    setCreateMode(false);
    setEditMode(false);
    initializeData();
  };

  const handleDeleteConfirmed = () => {
    handleConfirmationDialogClose();
    dispatch(setSelectedEndPoint(undefined));
    dispatch(asyncDeleteCustomEndpoints({ _id: selectedEndpoint._id }));
  };

  const handleNameChange = (event: any) => {
    dispatch(setEndpointData({ name: event.target.value }));
  };

  const disableSubmit = () => {
    if (!endpoint.name) return true;
    if (!endpoint.selectedSchema) return true;
    if (endpoint.operation === -1) return true;

    let invalidQueries;
    let invalidAssignments;

    if (endpoint.operation === OperationsEnum.POST) {
      if (!endpoint.assignments || endpoint.assignments.length === 0) return true;
      invalidAssignments = hasInvalidAssignments(endpoint.assignments);
    }
    if (endpoint.operation === OperationsEnum.PUT) {
      if (!endpoint.queries || endpoint.queries.length === 0) return true;
      invalidQueries = hasInvalidQueries(endpoint.queries);
      if (!endpoint.assignments || endpoint.assignments.length === 0) return true;
      invalidAssignments = hasInvalidAssignments(endpoint.assignments);
    }
    if (endpoint.operation === OperationsEnum.PATCH) {
      if (!endpoint.queries || endpoint.queries.length === 0) return true;
      invalidQueries = hasInvalidQueries(endpoint.queries);
      if (!endpoint.assignments || endpoint.assignments.length < 1) return true;
      invalidAssignments = hasInvalidAssignments(endpoint.assignments);
    }
    if (endpoint.operation === OperationsEnum.DELETE) {
      if (!endpoint.queries || endpoint.queries.length === 0) return true;
      invalidQueries = hasInvalidQueries(endpoint.queries);
    }
    if (endpoint.operation === OperationsEnum.GET) {
      if (!endpoint.queries || endpoint.queries.length === 0) return true;
      invalidQueries = hasInvalidQueries(endpoint.queries);
    }

    if (invalidQueries || invalidAssignments) {
      return true;
    }
    const invalidInputs = hasInvalidInputs(endpoint.inputs);
    if (invalidInputs) {
      return true;
    }
  };

  const renderSaveSection = () => {
    if (!editMode && !createMode) {
      return null;
    }

    return (
      <SaveSection
        editMode={editMode}
        createMode={createMode}
        disableSubmit={disableSubmit()}
        handleSaveClick={() => handleSubmit(true)}
        handleCreateClick={() => handleSubmit(false)}
        handleCancelClick={handleCancelClick}
      />
    );
  };

  const renderDetails = () => {
    if (!endpoint.selectedSchema || endpoint.operation === -1) return null;
    return (
      <>
        <InputsSection editMode={editMode} />
        {endpoint.operation !== OperationsEnum.POST && <QueriesSection editMode={editMode} />}
        {(endpoint.operation === OperationsEnum.PUT ||
          endpoint.operation === OperationsEnum.POST ||
          endpoint.operation === OperationsEnum.PATCH) && (
          <AssignmentsSection editMode={editMode} />
        )}
      </>
    );
  };

  const renderMainContent = () => {
    if (!selectedEndpoint && !createMode) {
      return (
        <Box sx={{ marginTop: '100px', textAlign: 'center' }}>
          <Typography variant="h6">Select an endpoint to view more</Typography>
        </Box>
      );
    } else {
      return (
        <Box display="flex" pt={2} gap={1} flexDirection="column">
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              size="small"
              disabled={!editMode}
              variant={'outlined'}
              label={'Name'}
              value={endpoint.name}
              onChange={handleNameChange}
            />
            <InformationTooltip />
            <Box display="flex" justifyContent="flex-end" width="100%">
              {!editMode && (
                <IconButton
                  disableRipple
                  aria-label="delete"
                  onClick={handleDeleteClick}
                  size="large">
                  <Delete color="error" />
                </IconButton>
              )}
              {!editMode && (
                <IconButton
                  disableRipple
                  color="primary"
                  aria-label="edit"
                  onClick={handleEditClick}
                  size="large">
                  <Edit />
                </IconButton>
              )}
            </Box>
          </Box>
          <OperationSection
            editMode={editMode}
            createMode={createMode}
            availableSchemas={schemaDocuments}
          />
          {renderDetails()}
          {renderSaveSection()}
        </Box>
      );
    }
  };

  return (
    <>
      <InfiniteScrollLayout
        listActions={
          <Grid spacing={2} container item>
            <Grid item sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                name="Search"
                size="small"
                label="Find endpoint"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item sm={6}>
              <FormControl size="small" fullWidth variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel id="operation">Operation</InputLabel>
                <Select
                  sx={{ borderRadius: 2 }}
                  label="Provider"
                  labelId="operation"
                  value={filters.operation}
                  onChange={(event) => {
                    dispatch(setEndpointsOperation(event.target.value as number));
                  }}>
                  <MenuItem value={-2}>
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value={0}>GET</MenuItem>
                  <MenuItem value={1}>POST</MenuItem>
                  <MenuItem value={2}>PUT</MenuItem>
                  <MenuItem value={3}>DELETE</MenuItem>
                  <MenuItem value={4}>PATCH</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <Box display="flex" gap={1} alignItems="center">
                <ConduitMultiSelect
                  formControlProps={{ fullWidth: true }}
                  handleChange={handleFilterChange}
                  label="Schemas"
                  options={schemasWithEndpoints}
                  values={schemas}
                  sortBy="name"
                />
                <Tooltip title="Custom Endpoints Documentation">
                  <a
                    href="https://getconduit.dev/docs/modules/database/tutorials/custom_endpoints"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}>
                    <Icon
                      sx={{
                        color:
                          theme.palette.mode === 'dark'
                            ? theme.palette.common.white
                            : theme.palette.common.black,
                      }}>
                      <InfoOutlined />
                    </Icon>
                  </a>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        }
        list={
          <EndpointsList
            handleListItemSelect={handleListItemSelect}
            search={filters.search}
            operation={filters.operation}
            selectedSchemas={schemas}
          />
        }
        infoComponent={renderMainContent()}
        buttonText={'create endpoint'}
        buttonClick={handleAddNewEndpoint}
      />
      <ConfirmationDialog
        buttonText={'Delete'}
        open={confirmationOpen}
        title={'Custom Endpoint Deletion'}
        description={`You are about to
        delete custom endpoint with name:${selectedEndpoint?.name}`}
        handleClose={handleConfirmationDialogClose}
        buttonAction={handleDeleteConfirmed}
      />
    </>
  );
};

export default CustomEndpointsLayout;
