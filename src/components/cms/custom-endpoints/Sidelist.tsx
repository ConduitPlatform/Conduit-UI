import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Checkbox,
  ListItemText,
  Input,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AddCircleOutline, Search } from '@material-ui/icons';
import EndpointsList from './EndpointsList';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useDebounce from '../../../hooks/useDebounce';
import {
  endpointCleanSlate,
  setEndpointData,
  setSelectedEndPoint,
} from '../../../redux/slices/customEndpointsSlice';
import { setEndpointsOperation, setEndpointsSearch } from '../../../redux/slices/cmsSlice';

const useStyles = makeStyles((theme) => ({
  listBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRight: '1px solid #000000',
    height: '100%',
  },
  divider: {
    '&.MuiDivider-root': {
      height: '2px',
      background: theme.palette.primary.main,
      borderRadius: '4px',
      margin: theme.spacing(0.5),
    },
  },
  button: {
    margin: theme.spacing(1),
    textTransform: 'none',
    color: 'white',
  },
  actions: {
    padding: theme.spacing(1),
  },
  formControl: {
    minWidth: 150,
  },
  noEndpoints: {
    textAlign: 'center',
    marginTop: '100px',
  },
  loadMore: {
    textAlign: 'center',
  },
}));

interface Props {
  setEditMode: (edit: boolean) => void;
  setCreateMode: (create: boolean) => void;
  filters: { search: string; operation: number };
}

const SideList: FC<Props> = ({ setEditMode, setCreateMode, filters }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [schemas, setSchemas] = useState<string[]>(['']);
  const debouncedSearch = useDebounce(search, 500);
  const { schemaDocuments } = useAppSelector((state) => state.cmsSlice.data.schemas);

  const finalSchemas = schemaDocuments.map((schema) => schema.name);

  useEffect(() => {
    dispatch(setEndpointsSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

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

  const handleFilterChange = (event: React.ChangeEvent<{ value: any }>) => {
    setSchemas(event.target.value);
  };

  return (
    <Box>
      <Grid className={classes.actions} spacing={2} container>
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
          <Button
            fullWidth
            endIcon={<AddCircleOutline />}
            color="secondary"
            variant="contained"
            onClick={handleAddNewEndpoint}>
            Add Endpoint
          </Button>
        </Grid>
        <Grid item sm={7}>
          <FormControl
            style={{ marginTop: '-8px' }}
            fullWidth
            size="small"
            className={classes.formControl}>
            <InputLabel id="multiple-select-label">Owner</InputLabel>
            <Select
              labelId="multiple-select-label"
              id="filters"
              multiple
              value={schemas}
              onChange={handleFilterChange}
              input={<Input />}
              renderValue={(selected: any) => (selected.length === 1 ? selected : 'multiple')}
              MenuProps={{
                getContentAnchorEl: null,
              }}>
              {finalSchemas &&
                finalSchemas.map((module: any) => (
                  <MenuItem key={module} value={module}>
                    <Checkbox checked={schemas.indexOf(module) > -1} />
                    <ListItemText primary={module} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item sm={5}>
          <FormControl size="small" fullWidth variant="outlined" className={classes.formControl}>
            <InputLabel>Operation</InputLabel>
            <Select
              label="Provider"
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
      </Grid>

      <Box height="72vh">
        <EndpointsList
          handleListItemSelect={handleListItemSelect}
          search={filters.search}
          operation={filters.operation}
        />
      </Box>
    </Box>
  );
};

export default SideList;
