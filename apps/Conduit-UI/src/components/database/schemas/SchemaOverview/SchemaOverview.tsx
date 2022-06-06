import React, { FC, useState } from 'react';
import { Grid, Box, Button } from '@mui/material';
import { Schema } from '../../../../models/database/CmsModels';
import JSONInput from 'react-json-editor-ajrm';
import { ExtractSchemaInfo } from '../../../../utils/ExtractSchemaInfo';
import { localeEn } from '../../../../models/JSONEditorAjrmLocale';
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

interface Props {
  schema: Schema;
  introspection?: boolean;
  setIntrospectionModal?: (introspectionModal: boolean) => void;
}

export const SchemaOverview: FC<Props> = ({ schema, introspection, setIntrospectionModal }) => {
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

    setOpenDialog(false);
  };

  const handleToggleSchema = () => {
    dispatch(asyncToggleSchema(selectedSchemaForAction.data._id));
    setSelectedSchemaForAction({ data: {}, action: '' });
    setOpenDialog(false);
  };

  const extractButtonsLeft = () => {
    if (schema.modelOptions.conduit.cms && !schema.modelOptions.conduit.cms.enabled) {
      return (
        <Button
          onClick={() => {
            setSelectedSchemaForAction({ data: schema, action: 'delete' });
            setOpenDialog(true);
          }}
          variant="outlined"
          color="error">
          Delete
        </Button>
      );
    }

    if (schema.modelOptions.conduit.cms && schema.modelOptions.conduit.cms.enabled)
      <Button
        onClick={() => {
          setSelectedSchemaForAction({ data: schema, action: 'delete' });
          setOpenDialog(true);
        }}
        variant="outlined"
        color="error">
        Delete
      </Button>;
    return (
      <Button
        onClick={() => {
          setSelectedSchemaForAction({ data: schema, action: 'archive' });
          setOpenDialog(true);
        }}
        disabled={schema.ownerModule !== 'database'}
        color="warning"
        variant="outlined">
        Archive
      </Button>
    );
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
          color="secondary">
          Enable
        </Button>
      );
    }
    return (
      <Button variant="contained" color="secondary" onClick={() => handleEditClick(schema._id)}>
        {schema.ownerModule === 'database' ? 'Edit' : 'Extend'}
      </Button>
    );
  };

  const formattedFields = getSchemaFieldsWithExtra(schema.fields);

  const goToSchemaEndpoints = (name: string) => {
    router.push(`/database/custom?schema=${name}`, undefined, { shallow: true });
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Box pr={3} pt={2} display="flex" gap={2}>
          <Button variant="outlined" onClick={() => setObjectView(!objectView)}>
            {objectView ? 'Switch to Json View' : 'Switch to Object View'}
          </Button>
          <Button
            onClick={() => setInfoDrawer(true)}
            variant="outlined"
            startIcon={<InfoOutlinedIcon />}>
            Schema Info
          </Button>
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={2} pr={3} pt={2}>
          {!introspection ? (
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
            setIntrospectionModal && (
              <Button
                color="secondary"
                variant="contained"
                onClick={() => handleFinalization(schema._id)}>
                Import Schema
              </Button>
            )
          )}
        </Box>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ padding: '20px', mt: 2 }}>
          <Box
            height="69vh"
            sx={{
              overflow: 'auto',
              overflowX: 'hidden',
              background: '#202030',
              borderRadius: 4,
            }}>
            {objectView ? (
              Object.keys({ newTypeFields: formattedFields }).map((dataKey, i) => (
                <SchemaViewer dataKey={dataKey} data={{ newTypeFields: formattedFields }} key={i} />
              ))
            ) : (
              <JSONInput
                placeholder={schema?.fields}
                locale={localeEn}
                viewOnly
                colors={{
                  background: '#202030',
                  keys: '#07D9C4',
                  string: 'white',
                }}
                height="69vh"
                width="100%"
                confirmGood={false}
              />
            )}
          </Box>
          <Box textAlign="center" pt={2}></Box>
        </Grid>
        <Grid
          item
          container
          xs={12}
          alignContent="space-between"
          sx={{ padding: '20px', marginTop: '23px' }}></Grid>
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
    </>
  );
};
