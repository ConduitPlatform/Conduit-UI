import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  Grid,
  Icon,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  useTheme,
} from '@mui/material';
import { ConduitMultiSelect } from '@conduitplatform/ui-components';
import { InfoOutlined, Search } from '@mui/icons-material';
import { useAppDispatch } from '../../../redux/store';
import { Schema } from '../../../models/database/CmsModels';
import { setEndpointsOperation, setEndpointsSearch } from '../../../redux/slices/databaseSlice';
import useDebounce from '../../../hooks/useDebounce';

interface Props {
  filters: any;
  schemasWithEndpoints: Schema[];
  schemas: any;
  handleFilterChange: any;
}

const ListActions: FC<Props> = ({ filters, schemasWithEndpoints, handleFilterChange, schemas }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  console.log(filters);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    dispatch(setEndpointsSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  return (
    <Grid spacing={2} container item>
      <Grid item sm={6}>
        <TextField
          fullWidth
          variant="outlined"
          name="Search"
          size="small"
          label="Find endpoint"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item sm={6}>
        <FormControl size="small" fullWidth variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel id="operation">Operation</InputLabel>
          <Select
            sx={{ borderRadius: 2 }}
            label="Provider"
            labelId="operation"
            value={filters.operation}
            onChange={(event) => {
              dispatch(setEndpointsOperation(event.target.value as number));
            }}>
            <MenuItem value={-2}>
              <em>All</em>
            </MenuItem>
            <MenuItem value={0}>GET</MenuItem>
            <MenuItem value={1}>POST</MenuItem>
            <MenuItem value={2}>PUT</MenuItem>
            <MenuItem value={3}>DELETE</MenuItem>
            <MenuItem value={4}>PATCH</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item sm={12}>
        <Box display="flex" gap={1} alignItems="center">
          <ConduitMultiSelect
            formControlProps={{ fullWidth: true }}
            handleChange={handleFilterChange}
            label="Schemas"
            options={schemasWithEndpoints}
            values={schemas}
            sortBy="name"
          />
          <Tooltip title="Custom Endpoints Documentation">
            <a
              href="https://getconduit.dev/docs/modules/database/tutorials/custom_endpoints"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}>
              <Icon
                sx={{
                  color:
                    theme.palette.mode === 'dark'
                      ? theme.palette.common.white
                      : theme.palette.common.black,
                }}>
                <InfoOutlined />
              </Icon>
            </a>
          </Tooltip>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ListActions;
