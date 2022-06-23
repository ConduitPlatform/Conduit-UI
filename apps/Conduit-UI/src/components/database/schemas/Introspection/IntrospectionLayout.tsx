import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import React, { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { Button, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import useDebounce from '../../../../hooks/useDebounce';
import { useRouter } from 'next/router';
import { Schema } from '../../../../models/database/CmsModels';
import { SchemaOverview } from '../SchemaOverview/SchemaOverview';

import IntrospectionSchemasList from './IntrospectionSchemasList';
import IntrospectionModal from './IntrospectionModal';
import {
  asyncGetIntrospectionSchemas,
  asyncIntrospect,
} from '../../../../redux/slices/databaseSlice';

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
  const debouncedSchemaSearch: string = useDebounce(schemaSearch, 500);
  const [introspectionModal, setIntrospectionModal] = useState<boolean>(false);
  useEffect(() => {
    setSchemaName((schemaModel as string) ?? '');
  }, [schemaModel]);

  useEffect(() => {
    if (schemas.length) {
      if (!schemaName) setActualSchema(undefined);
      const schemaFound = schemas.find((schema) => schema.name === schemaName);
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
    <Container maxWidth={'xl'}>
      <Box
        sx={{
          height: '80vh',
          flexGrow: 1,
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.05)',
          display: 'flex',
        }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', padding: 3 }}>
          <Box>
            <Grid sx={{ minWidth: '300px' }} spacing={1} container>
              <Grid item xs={12}>
                <TextField
                  size="small"
                  variant="outlined"
                  fullWidth
                  name="Search"
                  value={schemaSearch}
                  onChange={(e) => setSchemaSearch(e.target.value)}
                  label="Find schema"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          <Box pt={2} height="70vh" width="auto">
            <IntrospectionSchemasList
              handleListItemSelect={handleChange}
              search={debouncedSchemaSearch}
              actualSchema={actualSchema}
            />
          </Box>
          <Box padding="10px">
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => handleIntrospectSchemas()}>
              Introspect Schemas
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            width: '100%',
            paddingBottom: '0',
            marginBottom: '0',
          }}>
          {actualSchema ? (
            <SchemaOverview
              schema={actualSchema}
              introspection
              setIntrospectionModal={setIntrospectionModal}
            />
          ) : (
            <Typography sx={{ marginTop: 20 }} variant={'h6'} textAlign={'center'}>
              No selected Schema
            </Typography>
          )}
        </Box>
      </Box>
      {actualSchema && (
        <IntrospectionModal
          open={introspectionModal}
          setOpen={setIntrospectionModal}
          schema={actualSchema}
        />
      )}
    </Container>
  );
};

export default IntrospectionLayout;
