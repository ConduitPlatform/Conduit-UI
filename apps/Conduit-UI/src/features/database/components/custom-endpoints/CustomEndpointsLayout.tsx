import React, { FC, useCallback, useEffect, useState } from 'react';
import { findFieldsWithTypes, getCompiledFieldsOfSchema } from '../../utils/cms';
import { ConfirmationDialog } from '@conduitplatform/ui-components';
import { v4 as uuidv4 } from 'uuid';
import {
  endpointCleanSlate,
  setAccessibleSchemaFields,
  setCompiledSchemaFields,
  setEndpointData,
  setSelectedEndPoint,
} from '../../store/customEndpointsSlice';
import { Schema } from '../../models/CmsModels';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  asyncDeleteCustomEndpoints,
  asyncGetSchemasWithEndpoints,
} from '../../store/databaseSlice';
import InfiniteScrollLayout from '../../../../components/InfiniteScrollLayout';
import { useRouter } from 'next/router';
import { enqueueInfoNotification } from '../../../../utils/useNotifier';
import EndpointsList from './EndpointsList';
import { getAccesssibleSchemaFields } from '../../http/DatabaseRequests';
import ListActions from './ListActions';
import MainContent from './MainContent';

const CustomEndpointsLayout: FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { schema } = router.query;

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [schemas, setSchemas] = useState<string[]>([]);

  const { endpoint, selectedEndpoint } = useAppSelector((state) => state.customEndpointsSlice.data);
  const { schemasWithEndpoints } = useAppSelector((state) => state.databaseSlice.data);
  const { filters } = useAppSelector((state) => state.databaseSlice.data.customEndpoints);

  const {
    schemas: { schemaDocuments },
  } = useAppSelector((state) => state.databaseSlice.data);

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

  const handleListItemSelect = (endpoint: any) => {
    dispatch(setSelectedEndPoint(endpoint));
    dispatch(setEndpointData({ ...endpoint }));
    setCreateMode(false);
  };

  const handleFilterChange = (event: any) => {
    setSchemas(event.target.value);
    if (schema) {
      router.replace('/database/custom', undefined, { shallow: true });
    }
  };

  const handleConfirmationDialogClose = () => {
    setConfirmationOpen(false);
  };

  const handleDeleteConfirmed = () => {
    handleConfirmationDialogClose();
    dispatch(setSelectedEndPoint(undefined));
    dispatch(asyncDeleteCustomEndpoints({ _id: selectedEndpoint._id }));
  };

  const handleAddNewEndpoint = () => {
    dispatch(endpointCleanSlate());
    setEditMode(true);
    setCreateMode(true);
  };

  return (
    <>
      <InfiniteScrollLayout
        listActions={
          <ListActions
            filters={filters}
            handleFilterChange={handleFilterChange}
            schemas={schemas}
            schemasWithEndpoints={schemasWithEndpoints}
          />
        }
        list={
          <EndpointsList
            handleListItemSelect={handleListItemSelect}
            search={filters.search}
            operation={filters.operation}
            selectedSchemas={schemas}
          />
        }
        infoComponent={
          <MainContent
            createMode={createMode}
            setCreateMode={setCreateMode}
            editMode={editMode}
            setEditMode={setEditMode}
            endpoint={endpoint}
            schemaDocuments={schemaDocuments}
            selectedEndpoint={selectedEndpoint}
            filters={filters}
            setConfirmationOpen={setConfirmationOpen}
            initializeData={initializeData}
          />
        }
        buttonText="create endpoint"
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
