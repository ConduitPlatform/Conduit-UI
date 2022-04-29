import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { AddCircleOutlined, Search } from '@mui/icons-material';
import EndpointsList from './EndpointsList';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useDebounce from '../../../hooks/useDebounce';
import {
  endpointCleanSlate,
  setEndpointData,
  setSelectedEndPoint,
} from '../../../redux/slices/customEndpointsSlice';
import {
  asyncGetSchemasWithEndpoints,
  setEndpointsOperation,
  setEndpointsSearch,
} from '../../../redux/slices/databaseSlice';
import { useRouter } from 'next/router';
import { enqueueInfoNotification } from '../../../utils/useNotifier';
import { ConduitMultiSelect } from '@conduitplatform/ui-components';

interface Props {
  setEditMode: (edit: boolean) => void;
  setCreateMode: (create: boolean) => void;
  filters: { search: string; operation: number };
}

const SideList: FC<Props> = ({ setEditMode, setCreateMode, filters }) => {
  const router = useRouter();
  const { schema } = router.query;
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [schemas, setSchemas] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 500);
  const { schemasWithEndpoints } = useAppSelector((state) => state.databaseSlice.data);

  useEffect(() => {
    dispatch(setEndpointsSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    dispatch(asyncGetSchemasWithEndpoints());
  }, [dispatch]);

  useEffect(() => {
    if (schema) {
      const isFound = schemasWithEndpoints.some((element) => {
        if (element.name === schema) {
          return true;
        }
      });
      if (!isFound) {
        router.replace('/database/custom', undefined, { shallow: true });
        dispatch(
          enqueueInfoNotification('Selected schema has no available endpoints!', 'duplicate')
        );
      } else {
        setSchemas([`${schema}`]);
      }
    }
  }, [schema, dispatch, router, schemasWithEndpoints]);

  const handleListItemSelect = (endpoint: any) => {
    dispatch(setSelectedEndPoint(endpoint));
    dispatch(setEndpointData({ ...endpoint }));
    setCreateMode(false);
  };

  const handleAddNewEndpoint = () => {
    dispatch(endpointCleanSlate());
    setEditMode(true);
    setCreateMode(true);
  };

  const handleFilterChange = (event: any) => {
    setSchemas(event.target.value);
    if (schema) {
      router.replace('/database/custom', undefined, { shallow: true });
    }
  };

  return (
    <Box>
      <Grid sx={{ padding: 1 }} spacing={2} container>
        <Grid item sm={7}>
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
        <Grid item sm={5}>
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
        <Grid item sm={10}>
          <ConduitMultiSelect
            handleChange={handleFilterChange}
            label="Schemas"
            options={schemasWithEndpoints}
            values={schemas}
            sortBy="name"
          />
        </Grid>
        <Grid item xs={2}>
          <IconButton
            sx={{ marginTop: '-3px' }}
            color="secondary"
            onClick={handleAddNewEndpoint}
            size="large">
            <AddCircleOutlined />
          </IconButton>
        </Grid>
      </Grid>

      <Box height="68vh">
        <EndpointsList
          handleListItemSelect={handleListItemSelect}
          search={filters.search}
          operation={filters.operation}
          selectedSchemas={schemas}
        />
      </Box>
    </Box>
  );
};

export default SideList;
