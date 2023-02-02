import { SideDrawerWrapper } from '@conduitplatform/ui-components';
import { Add, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  styled,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { FC, useState, useEffect } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { Schema, SchemaIndex } from '../../../../models/CmsModels';
import {
  asyncCreateSchemaIndex,
  asyncDeleteSchemaIndexes,
  asyncGetDatabaseType,
  asyncGetSchemaIndexes,
  clearSelectedIndexes,
} from '../../../../store/databaseSlice';
import { useAppDispatch, useAppSelector } from '../../../../../../redux/store';
import { enqueueInfoNotification } from '../../../../../../hooks/useNotifier';
import IndexCard from './IndexCard';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  schema: Schema;
}

const CustomizedGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  display: 'flex',
  marginBottom: theme.spacing(0.5),
  alignItems: 'center',
  width: '100%',
}));

const mongoDbIndexTypes = [
  { value: 1, label: 'Ascending' },
  { value: -1, label: 'Descending' },
  { value: '2d', label: '2d' },
  { value: '2dsphere', label: '2dsphere' },
  { value: 'geoHaystack', label: 'GeoHaystack' },
  { value: 'hashed', label: 'Hashed' },
  { value: 'text', label: 'Text' },
];

const postgresIndexTypes = [
  { value: 'BTREE', label: 'BTREE' },
  { value: 'HASH', label: 'HASH' },
  { value: 'GIST', label: 'GIST' },
  { value: 'SPGIST', label: 'SPGIST' },
  { value: 'GIN', label: 'GIN' },
  { value: 'BRIN', label: 'BRIN' },
];

const SchemaIndexesDrawer: FC<Props> = ({ open, setOpen, schema }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const {
    indexes: { schemaIndexes, schemaIndexesLoading },
    typeOfDb,
  } = useAppSelector((state) => state.databaseSlice.data);
  const [indexName, setIndexName] = useState<string>('');
  const [postgresType, setPostgresType] = useState<string>('');
  const [inputFields, setInputFields] = useState<{ id: string; field: string; type: string }[]>([
    { id: uuidV4(), field: '', type: '' },
  ]);

  useEffect(() => {
    if (open) {
      dispatch(asyncGetSchemaIndexes({ id: schema._id }));
      dispatch(asyncGetDatabaseType());
    }
  }, [dispatch, schema._id, open]);

  const handleAddField = () => {
    setInputFields([...inputFields, { id: uuidV4(), field: '', type: '' }]);
  };

  const nonUniqueSchemaFields = Object.entries(schema.compiledFields).filter(
    (value: any) => !value?.unique
  );

  const formattedSchemaFields = nonUniqueSchemaFields.map((item) => item[0]);

  const handleFieldsChange = (id: string) => (evt: any) => {
    const { value } = evt.target;

    setInputFields((list) =>
      list.map((el) =>
        el.id === id
          ? {
              ...el,
              [evt.target.name]: value,
            }
          : el
      )
    );
  };

  const handleRemoveField = (id: string) => {
    setInputFields((list) => list.filter((el) => el.id !== id));
  };

  const handleCreateIndex = () => {
    if (indexName === '') {
      dispatch(enqueueInfoNotification('You have to specify a name for your index!'));
      return;
    }

    const formattedFields = inputFields.map((item) => item.field);

    if (typeOfDb === 'MongoDB') {
      const formattedTypes = inputFields.map((item) => item.type);

      const formattedValues = {
        indexes: [
          {
            fields: formattedFields,
            types: formattedTypes,
            options: {
              name: indexName,
            },
          },
        ],
      };
      dispatch(asyncCreateSchemaIndex({ id: schema._id, data: formattedValues }));
    } else if (typeOfDb === 'PostgreSQL') {
      if (!postgresType) {
        dispatch(enqueueInfoNotification('You have to specify a type for your indexes!'));
        return;
      }
      const formattedValues = {
        indexes: [
          {
            fields: formattedFields,
            types: postgresType,
            options: {
              name: indexName,
            },
          },
        ],
      };
      dispatch(asyncCreateSchemaIndex({ id: schema._id, data: formattedValues }));
    }
    setInputFields([{ id: uuidV4(), field: '', type: '' }]);
    setIndexName('');
  };

  const handleCloseDrawer = () => {
    setInputFields([{ id: uuidV4(), field: '', type: '' }]);
    dispatch(clearSelectedIndexes());
    setOpen(false);
  };

  const handleDeleteIndex = (name: string) => {
    dispatch(asyncDeleteSchemaIndexes({ id: schema._id, names: [name] }));
  };

  return (
    <SideDrawerWrapper
      title={`Indexes for Schema: ${schema?.name}`}
      minWidth={600}
      maxWidth={600}
      open={open}
      closeDrawer={handleCloseDrawer}>
      <Box
        sx={{
          background: theme.palette.mode === 'dark' ? '#262840' : '#F2F2F2',
          borderRadius: '15px',
          p: 2,
        }}>
        <Grid container spacing={2}>
          <Grid item container xs={12} spacing={2}>
            <Grid item xs={typeOfDb === 'PostgreSQL' ? 6 : 12}>
              <TextField
                fullWidth
                value={indexName}
                onChange={(e) => setIndexName(e.target.value)}
                label="Index name"
              />
            </Grid>
            {typeOfDb === 'PostgreSQL' && (
              <Grid item xs={6}>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    sx={{ borderRadius: 2 }}
                    onChange={(e: SelectChangeEvent) => setPostgresType(e.target.value)}
                    fullWidth>
                    {postgresIndexTypes?.map((field, index) => (
                      <MenuItem key={index} value={field.value}>
                        {field.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">Schema fields:</Typography>
              <IconButton color="primary" size="small" aria-label="add" onClick={handleAddField}>
                <Add />
              </IconButton>
            </Box>
          </Grid>
          <Grid item sm={12}>
            {!schemaIndexesLoading && !schemaIndexes.length && (
              <Typography pt={10} textAlign="center">
                There are currently no indexes for this Schema
              </Typography>
            )}
            {inputFields.map((inputField, index: number) => {
              return (
                <Grid key={index} container spacing={1} sx={{ mt: 0.2 }}>
                  <CustomizedGrid item xs={typeOfDb !== 'PostgreSQL' ? 6 : 11}>
                    <FormControl fullWidth sx={{ minWidth: 200 }}>
                      <InputLabel>Field</InputLabel>
                      <Select
                        fullWidth
                        label="Field"
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                        value={inputField.field}
                        onChange={handleFieldsChange(inputField.id)}
                        name="field">
                        {formattedSchemaFields?.map((field, index) => (
                          <MenuItem key={index} value={field}>
                            {field}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CustomizedGrid>
                  {typeOfDb !== 'PostgreSQL' && (
                    <CustomizedGrid item xs={5}>
                      <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          label="Type"
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                          value={inputField.type}
                          onChange={handleFieldsChange(inputField.id)}
                          name="type">
                          {mongoDbIndexTypes?.map((field, index) => (
                            <MenuItem key={index} value={field.value}>
                              {field.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </CustomizedGrid>
                  )}
                  <CustomizedGrid item xs={1}>
                    <IconButton
                      color="error"
                      size="small"
                      aria-label="delete"
                      onClick={() => handleRemoveField(inputField.id)}>
                      <Delete />
                    </IconButton>
                  </CustomizedGrid>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
        <Box pt={2} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={() => handleCreateIndex()}>
            Create index
          </Button>
        </Box>
      </Box>
      {!schemaIndexesLoading && schemaIndexes.length > 0 && (
        <Box pt={4}>
          <Grid container spacing={2}>
            {schemaIndexes.map((index: SchemaIndex, key: number) => (
              <Grid key={key} item xs={12}>
                <IndexCard handleDeleteIndex={handleDeleteIndex} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {schemaIndexesLoading && (
        <Box pt={4}>
          <Grid container spacing={2}>
            {[1, 1, 1].map((item, key: number) => (
              <Grid height="120px" key={key} item xs={12}>
                <Skeleton sx={{ height: '100%', borderRadius: '16px' }} variant="rectangular" />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </SideDrawerWrapper>
  );
};

export default SchemaIndexesDrawer;
