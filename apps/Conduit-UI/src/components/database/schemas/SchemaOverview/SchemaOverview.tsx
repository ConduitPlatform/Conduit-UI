import React, { FC, useState } from 'react';
import { Grid, Box, Button } from '@mui/material';
import { Schema } from '../../../../models/database/CmsModels';
import { ExtractSchemaInfo } from '../../../../utils/ExtractSchemaInfo';
import { useRouter } from 'next/router';
import { useAppDispatch } from '../../../../redux/store';
import SchemaActionsDialog, { actions } from './SchemaActionsDialog';
import {
  asyncDeleteSelectedSchemas,
  asyncToggleSchema,
} from '../../../../redux/slices/databaseSlice';
import SchemaViewer from './SchemaViewer';
import { getSchemaFieldsWithExtra } from '../../../../utils/type-functions';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { SideDrawerWrapper } from '@conduitplatform/ui-components';
import Data from '../../../../assets/svgs/data.svg';
import Image from 'next/image';
import JsonEditorComponent from '../../../common/JsonEditorComponent';
import SchemaIndexesDrawer from './Indexes/SchemaIndexesDrawer';
import { Numbers } from '@mui/icons-material';

interface Props {
  schema: Schema;
  systemSchemas?: string[];
  introspection?: boolean;
  setIntrospectionModal?: (introspectionModal: boolean) => void;
}

export const SchemaOverview: FC<Props> = ({
  schema,
  systemSchemas,
  introspection,
  setIntrospectionModal,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedSchemaForAction, setSelectedSchemaForAction] = useState<{
    data: any;
    action: actions;
  }>({
    data: {},
    action: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [objectView, setObjectView] = useState(true);
  const [infoDrawer, setInfoDrawer] = useState(false);
  const [indexDrawer, setIndexDrawer] = useState(false);

  const handleEditClick = (id: string) => {
    router.push({
      pathname: `schemas/${id}`,
    });
  };

  const handleFinalization = (id: string) => {
    router.push({
      pathname: `introspection/${id}`,
    });
  };

  const handleDeleteSchema = (deleteData: boolean) => {
    dispatch(
      asyncDeleteSelectedSchemas({
        ids: [selectedSchemaForAction.data._id],
        deleteData: deleteData,
      })
    );
    setSelectedSchemaForAction({ data: {}, action: '' });
    router.push(`/database/schemas`, undefined, { shallow: true });
    setOpenDialog(false);
  };

  const handleToggleSchema = () => {
    dispatch(asyncToggleSchema(selectedSchemaForAction.data._id));
    setSelectedSchemaForAction({ data: {}, action: '' });
    setOpenDialog(false);
  };

  const extractButtonsLeft = () => {
    const enabled = schema.modelOptions.conduit?.cms?.enabled;
    if (schema.modelOptions.conduit.cms) {
      return (
        <Button
          onClick={() => {
            setSelectedSchemaForAction({ data: schema, action: enabled ? 'archive' : 'delete' });
            setOpenDialog(true);
          }}
          disabled={enabled ? schema.ownerModule !== 'database' : undefined}
          variant="outlined"
          color={enabled ? 'warning' : 'error'}>
          {enabled ? 'Archive' : 'Delete'}
        </Button>
      );
    }
  };

  const extractButtonsRight = () => {
    if (schema.modelOptions.conduit.cms && !schema.modelOptions.conduit.cms.enabled) {
      return (
        <Button
          onClick={() => {
            setSelectedSchemaForAction({ data: schema, action: 'enable' });
            setOpenDialog(true);
          }}
          variant="contained"
          color="primary">
          Enable
        </Button>
      );
    }
    return (
      <Button variant="contained" color="primary" onClick={() => handleEditClick(schema._id)}>
        {schema.ownerModule === 'database' ? 'Edit' : 'Extend'}
      </Button>
    );
  };

  const formattedFields = getSchemaFieldsWithExtra(schema.compiledFields);

  const goToSchemaEndpoints = (name: string) => {
    router.push(`/database/custom?schema=${name}`, undefined, { shallow: true });
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" sx={{ flexWrap: 'wrap' }}>
        <Box pr={3} pt={2} display="flex" gap={2} sx={{ minWidth: 240, flex: 1 }}>
          <Button variant="outlined" onClick={() => setObjectView(!objectView)}>
            {objectView ? 'Switch to Json View' : 'Switch to Object View'}
          </Button>
          <Button
            onClick={() => setInfoDrawer(true)}
            variant="outlined"
            startIcon={<InfoOutlinedIcon />}>
            Schema Info
          </Button>
          <Button onClick={() => setIndexDrawer(true)} variant="outlined" startIcon={<Numbers />}>
            Schema Indexes
          </Button>
        </Box>

        {!introspection ? (
          <Box
            display="flex"
            justifyContent="flex-end"
            gap={2}
            pr={3}
            pt={2}
            sx={{ minWidth: 280, flex: 1 }}>
            {!systemSchemas?.find((systemSchema) => schema.name === systemSchema) ? (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => goToSchemaEndpoints(schema.name)}>
                  Custom Endpoints
                </Button>
                {extractButtonsLeft()}
                {extractButtonsRight()}
              </>
            ) : (
              <Button disabled>System schemas cannot be modified</Button>
            )}
          </Box>
        ) : (
          <Box pr={3} pt={2}>
            {setIntrospectionModal && (
              <Button
                color="primary"
                variant="contained"
                onClick={() => handleFinalization(schema._id)}>
                Import Schema
              </Button>
            )}
          </Box>
        )}
      </Box>
      <Grid
        container
        sx={{
          display: 'flex',
          flex: 1,
          height: '100%',
          mt: 1,
          mb: 2,
          overflow: 'hidden',
        }}>
        <Grid
          item
          xs={12}
          sx={{
            height: '100%',
            paddingRight: 3,
            overflow: 'hidden',
            borderRadius: 4,
          }}>
          <Grid
            item
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}>
            {objectView ? (
              Object.keys({ newTypeFields: formattedFields }).map((dataKey, i) => (
                <SchemaViewer dataKey={dataKey} data={{ newTypeFields: formattedFields }} key={i} />
              ))
            ) : (
              <Box sx={{ borderRadius: 4, overflow: 'auto', height: '100%' }}>
                <JsonEditorComponent
                  placeholder={formattedFields}
                  viewOnly
                  height="100%"
                  width="100%"
                  confirmGood={false}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Grid>
      <SideDrawerWrapper
        title="Schema information"
        open={infoDrawer}
        closeDrawer={() => setInfoDrawer(false)}>
        <Box padding={3}>{ExtractSchemaInfo(schema, introspection)}</Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image src={Data} width="200px" height="200px" alt="addUser" />
        </Box>
      </SideDrawerWrapper>
      <SchemaActionsDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        handleToggle={handleToggleSchema}
        handleDelete={handleDeleteSchema}
        selectedSchema={selectedSchemaForAction}
      />
      <SchemaIndexesDrawer open={indexDrawer} setOpen={setIndexDrawer} schema={schema} />
    </>
  );
};
