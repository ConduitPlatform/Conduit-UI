import Box from '@mui/material/Box';
import React, { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { Button, Grid, Icon, InputAdornment, TextField, Typography } from '@mui/material';
import { InfoOutlined, Search } from '@mui/icons-material';
import useDebounce from '../../../../hooks/useDebounce';
import { useRouter } from 'next/router';
import { Schema } from '../../../../models/database/CmsModels';
import { SchemaOverview } from '../SchemaOverview/SchemaOverview';

import IntrospectionSchemasList from './IntrospectionSchemasList';
import IntrospectionModal from './IntrospectionModal';
import InfiniteScrollLayout from '../../../InfiniteScrollLayout';
import { asyncIntrospect } from '../../../../redux/slices/databaseSlice';
import { RichTooltip } from '@conduitplatform/ui-components';

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
  const [openTooltip, setOpenTooltip] = useState<boolean>(false);
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

  const MouseOverTooltip = () => {
    setOpenTooltip(!openTooltip);
  };

  const MouseOutTooltip = () => {
    setOpenTooltip(false);
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
                label="Find schema"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Box onMouseOver={MouseOverTooltip} onMouseOut={MouseOutTooltip}>
                <RichTooltip
                  content={
                    <Box display="flex" flexDirection="column" gap={2} p={2}>
                      <Typography variant="body2">
                        Database Introspection allows you to conveniently import all or some of your
                        schemas from an existing database without the need of manually creating each
                        one. Schemas can be edited and verified through the schema editor.
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
                  }
                  width="400px"
                  open={openTooltip}
                  onClose={MouseOutTooltip}>
                  <Icon>
                    <InfoOutlined />
                  </Icon>
                </RichTooltip>
              </Box>
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
      buttonText={'Introspect Schemas'}
      infoComponent={
        <>
          <Box
            sx={{
              width: '100%',
              overflow: 'hidden',
              borderRadius: 4,
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
          {actualSchema && (
            <IntrospectionModal
              open={introspectionModal}
              setOpen={setIntrospectionModal}
              schema={actualSchema}
            />
          )}
        </>
      }
      buttonClick={() => handleIntrospectSchemas()}
    />
  );
};

export default IntrospectionLayout;
