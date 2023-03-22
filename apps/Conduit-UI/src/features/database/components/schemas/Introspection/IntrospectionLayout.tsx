import Box from '@mui/material/Box';
import React, { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../redux/store';
import { Button, Grid, Icon, InputAdornment, TextField, Typography } from '@mui/material';
import { InfoOutlined, Search } from '@mui/icons-material';
import useDebounce from '../../../../../hooks/useDebounce';
import { useRouter } from 'next/router';
import { Schema } from '../../../models/CmsModels';
import { SchemaOverview } from '../SchemaOverview/SchemaOverview';
import IntrospectionSchemasList from './IntrospectionSchemasList';
import IntrospectionModal from './IntrospectionModal';
import InfiniteScrollLayout from '../../../../../components/InfiniteScrollLayout';
import { asyncIntrospect } from '../../../store/databaseSlice';
import { ConduitTooltip } from '@conduitplatform/ui-components';

const IntrospectionLayout: FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { schemaModel } = router.query;
  const { schemaDocuments: schemas } = useAppSelector(
    (state) => state.databaseSlice.data.introspectionSchemas
  );
  const [schemaSearch, setSchemaSearch] = useState<string>('');
  const [actualSchema, setActualSchema] = useState<Schema | undefined>(undefined);
  const [schemaName, setSchemaName] = useState('');
  const [introspectionModal, setIntrospectionModal] = useState<boolean>(false);

  const debouncedSchemaSearch: string = useDebounce(schemaSearch, 500);
  useEffect(() => {
    setSchemaName((schemaModel as string) ?? '');
  }, [schemaModel]);

  useEffect(() => {
    if (schemas.length) {
      if (!schemaName) setActualSchema(undefined);
      const schemaFound = schemas.find((schema: Schema) => schema.name === schemaName);
      setActualSchema(schemaFound);
    }
  }, [schemas, schemaName]);

  const handleChange = (value: string) => {
    router.push(`/database/introspection?schemaModel=${value}`, undefined, { shallow: true });
  };

  const handleIntrospectSchemas = () => {
    dispatch(asyncIntrospect());
  };

  return (
    <InfiniteScrollLayout
      listActions={
        <Grid container item display={'flex'}>
          <Grid item xs={12}>
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                size="small"
                variant="outlined"
                fullWidth
                name="Search"
                value={schemaSearch}
                onChange={(e) => setSchemaSearch(e.target.value)}
                label="Find model"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              <ConduitTooltip
                title={
                  <Box display="flex" flexDirection="column" gap={2} p={2}>
                    <Typography variant="body2">
                      Database Introspection allows you to conveniently import all or some of your
                      schemas from an existing database without the need of manually creating each
                      one. Schemas can be edited and verified through the model editor.
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                      <a
                        href="https://getconduit.dev/docs/modules/database/introspection"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}>
                        <Button variant="outlined">Tell me more</Button>
                      </a>
                    </Box>
                  </Box>
                }>
                <Icon>
                  <InfoOutlined />
                </Icon>
              </ConduitTooltip>
            </Box>
          </Grid>
        </Grid>
      }
      list={
        <IntrospectionSchemasList
          handleListItemSelect={handleChange}
          search={debouncedSchemaSearch}
          actualSchema={actualSchema}
        />
      }
      infoComponent={
        <>
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              flexFlow: 'column',
              width: '100%',
              overflow: 'hidden',
              borderRadius: 4,
              height: '100%',
            }}>
            {actualSchema ? (
              <SchemaOverview
                schema={actualSchema}
                introspection
                setIntrospectionModal={setIntrospectionModal}
              />
            ) : (
              <Typography sx={{ marginTop: 20 }} variant={'h6'} textAlign={'center'}>
                No model selected
              </Typography>
            )}
          </Box>
          {actualSchema && (
            <IntrospectionModal
              open={introspectionModal}
              setOpen={setIntrospectionModal}
              schema={actualSchema}
            />
          )}
        </>
      }
      buttons={
        <>
          <Button
            color={'primary'}
            variant={'contained'}
            fullWidth
            sx={{ whiteSpace: 'nowrap' }}
            onClick={handleIntrospectSchemas}>
            {'Introspect Models'}
          </Button>
        </>
      }
    />
  );
};

export default IntrospectionLayout;
