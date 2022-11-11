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
  styled,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { FC, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { Schema } from '../../../../models/database/CmsModels';
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

const indexes = [
  {
    fields: ['email', 'hashedPassword'],
    types: [1, -1],
    options: {
      name: 'MongoCompoundIndex',
    },
  },

  {
    fields: ['hashedPassword'],
    types: ['hashed'],
    options: {
      unique: true,
      name: 'MongoHashedIndex',
    },
  },
];

const mongoDbIndexTypes = [
  { value: '1', label: 'Ascending' },
  { value: '-1', label: 'Descending' },
  { value: '2d', label: '2d' },
  { value: '2dsphere', label: '2dsphere' },
  { value: 'geoHaystack', label: 'GeoHaystack' },
  { value: 'hashed', label: 'Hashed' },
  { value: 'text', label: 'Text' },
];

const postgresIndexTypes = [
  { value: 'BTREE', label: 'BTREE' },
  { value: '-HASH', label: 'HASH' },
  { value: 'GIST', label: 'GIST' },
  { value: 'SPGIST', label: 'SPGIST' },
  { value: 'GIN', label: 'GIN' },
  { value: 'BRIN', label: 'BRIN' },
];

const databaseType: 'postgres' | 'mongodb' = 'mongodb';

const SchemaIndexesDrawer: FC<Props> = ({ open, setOpen, schema }) => {
  const theme = useTheme();
  const [indexName, setIndexName] = useState<string>('');
  const [inputFields, setInputFields] = useState<{ id: string; field: string; type: string }[]>([
    { id: uuidV4(), field: '', type: '' },
  ]);
  const [postgresType, setPostgresType] = useState<string>('');

  const handleAddField = () => {
    setInputFields([...inputFields, { id: uuidV4(), field: '', type: '' }]);
  };

  const formattedSchemaFields = Object.keys(schema.fields);

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
    setInputFields([{ id: uuidV4(), field: '', type: '' }]);
    setIndexName('');
  };

  return (
    <SideDrawerWrapper
      title={`Schema ${schema?.name} indexes`}
      minWidth={600}
      maxWidth={600}
      open={open}
      closeDrawer={() => setOpen(false)}>
      <Box pt={4} pb={2}>
        <Typography textAlign="center">Create index</Typography>
      </Box>
      {!indexes.length && (
        <Typography pt={10} textAlign="center">
          There are currently no indexes for this Schema
        </Typography>
      )}
      <Box
        sx={{
          background: theme.palette.mode === 'dark' ? '#262840' : '#F2F2F2',
          borderRadius: '15px',
          p: 2,
        }}>
        <Grid container spacing={2}>
          <Grid item container xs={12} spacing={2}>
            <Grid item xs={databaseType === 'postgres' ? 6 : 12}>
              <TextField
                fullWidth
                value={indexName}
                onChange={(e) => setIndexName(e.target.value)}
                label="Index name"
              />
            </Grid>
            {databaseType === 'postgres' && (
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
            {inputFields.map((inputField, index: number) => {
              return (
                <Grid key={index} container spacing={1} sx={{ mt: 0.2 }}>
                  <CustomizedGrid item xs={databaseType !== 'postgres' ? 6 : 11}>
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
                  {databaseType !== 'postgres' && (
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
                      color="primary"
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
          <Button variant="contained" onClick={handleCreateIndex}>
            Create index
          </Button>
        </Box>
      </Box>
      {indexes.length && (
        <Box>
          <Typography textAlign="center" pt={4} pb={2}>
            Indexes
          </Typography>
          <Grid container spacing={2}>
            {indexes.map((index, key) => (
              <Grid key={key} item xs={12}>
                <IndexCard index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </SideDrawerWrapper>
  );
};

export default SchemaIndexesDrawer;
