import React, { FC, useState } from 'react';
import { Grid, Paper, Box, Button } from '@material-ui/core';
import { Schema } from '../../../models/cms/CmsModels';
import JSONInput from 'react-json-editor-ajrm';
import { ExtractSchemaInfo } from '../../../utils/ExtractSchemaInfo';
import { localeEn } from '../../../models/JSONEditorAjrmLocale';
import { useRouter } from 'next/router';
import { useAppDispatch } from '../../../redux/store';
import SchemaActionsDialog, { actions } from '../SchemaActionsDialog';
import { asyncDeleteSelectedSchemas, asyncToggleSchema } from '../../../redux/slices/cmsSlice';
import SchemaViewer from './SchemaViewer';
import { getSchemaFieldsWithExtra } from '../../../utils/type-functions';

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
  const [objectView, setObjectView] = useState(true);

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

  const formattedFields = getSchemaFieldsWithExtra(schema.fields);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={6} style={{ padding: '20px', marginTop: '23px' }}>
          <Box
            height="69vh"
            style={{
              overflow: 'auto',
              overflowX: 'hidden',
              background: '#202030',
              borderRadius: '8px',
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
                height="70vh"
                width="100%"
                confirmGood={false}
              />
            )}
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center" padding="8px">
            <Button variant="outlined" onClick={() => setObjectView(!objectView)}>
              {objectView ? 'Switch to Json View' : 'Switch to Object View'}
            </Button>
          </Box>
        </Grid>
        <Grid
          item
          container
          xs={6}
          alignContent="space-between"
          style={{ padding: '20px', marginTop: '23px' }}>
          <Grid item xs={12}>
            <Paper>
              <Grid item xs={12} style={{ padding: '10px' }}>
                <Button fullWidth variant="outlined" color="primary">
                  Custom Endpoints
                </Button>
              </Grid>
              <Grid container spacing={2} style={{ padding: '10px' }}>
                <Grid item xs={6}>
                  {extractButtonsLeft()}
                </Grid>
                <Grid item xs={6}>
                  {extractButtonsRight()}
                </Grid>
              </Grid>
              {ExtractSchemaInfo(schema)}
            </Paper>
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
