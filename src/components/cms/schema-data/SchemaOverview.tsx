import React, { FC, useState } from 'react';
import { Grid, Paper, Typography, Box, Button } from '@material-ui/core';
import { Schema } from '../../../models/cms/CmsModels';
import JSONInput from 'react-json-editor-ajrm';
import { ExtractSchemaInfo } from '../../../utils/ExtractSchemaInfo';
import { localeEn } from '../../../models/JSONEditorAjrmLocale';
import { useRouter } from 'next/router';
import { useAppDispatch } from '../../../redux/store';
import SchemaActionsDialog, { actions } from '../SchemaActionsDialog';
import { asyncDeleteSelectedSchemas, asyncToggleSchema } from '../../../redux/slices/cmsSlice';

interface Props {
  schema: Schema;
}

export const SchemaOverview: FC<Props> = ({ schema }) => {
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

  const handleEditClick = (id: string) => {
    router.push({
      pathname: `schemas/${id}`,
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
          fullWidth
          onClick={() => {
            setSelectedSchemaForAction({ data: schema, action: 'delete' });
            setOpenDialog(true);
          }}
          variant="outlined">
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
        fullWidth
        variant="outlined">
        Delete
      </Button>;
    return (
      <Button
        onClick={() => {
          setSelectedSchemaForAction({ data: schema, action: 'archive' });
          setOpenDialog(true);
        }}
        disabled={schema.ownerModule !== 'cms'}
        fullWidth
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
          fullWidth
          variant="contained"
          color="secondary">
          Enable
        </Button>
      );
    }
    return (
      <Button
        fullWidth
        variant="contained"
        color="secondary"
        onClick={() => handleEditClick(schema._id)}>
        {schema.ownerModule === 'cms' ? 'Edit' : 'Extend'}
      </Button>
    );
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={6} style={{ padding: '20px' }}>
          <Typography style={{ textAlign: 'center' }}>Schema Fields</Typography>
          <Box height="content-fit" maxHeight="68vh">
            <JSONInput
              placeholder={schema?.fields}
              locale={localeEn}
              viewOnly
              colors={{
                background: '#202030',
                keys: '#07D9C4',
                string: 'white',
              }}
              height="72vh"
              width="100%"
              confirmGood={false}
            />
          </Box>
        </Grid>
        <Grid
          item
          container
          xs={6}
          alignContent="space-between"
          style={{ padding: '20px', marginTop: '23px' }}>
          <Grid item xs={12}>
            <Paper>{ExtractSchemaInfo(schema)}</Paper>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth>Custom Endpoints</Button>
            <Box display="flex" justifyContent="flex-end" padding={'10px'}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  {extractButtonsLeft()}
                </Grid>
                <Grid item xs={6}>
                  {extractButtonsRight()}
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Grid>
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
