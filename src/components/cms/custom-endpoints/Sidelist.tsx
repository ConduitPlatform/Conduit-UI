import React, { FC } from 'react';
import {
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  ListItemIcon,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

import OperationsEnum from '../../../models/OperationsEnum';
import { Search } from '@material-ui/icons';

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
  getBadge: {
    backgroundColor: '#61affe',
    color: 'white',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  putBadge: {
    backgroundColor: '#fca130',
    color: 'white',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  patchBadge: {
    backgroundColor: '#50e3c2',
    color: 'white',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  postBadge: {
    backgroundColor: '#49cc90',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  deleteBadge: {
    backgroundColor: '#f93e3e',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  list: {
    '&.MuiList-root': {
      maxHeight: '580px',
      overflowY: 'auto',
      width: '100%',
    },
  },
  listItem: {
    '&.MuiListItem-root:hover': {
      background: theme.palette.grey[600],
      borderRadius: '4px',
    },
    '&.Mui-selected': {
      background: theme.palette.grey[700],
      borderRadius: '4px',
      color: '#ffffff',
    },
    '&.Mui-selected:hover': {
      background: theme.palette.grey[800],
      borderRadius: '4px',
      color: '#ffffff',
    },
  },
  actions: {
    padding: theme.spacing(1),
  },
  formControl: {
    minWidth: 150,
  },
}));

interface Props {
  endpoints: any;
  selectedEndpoint: any;
  handleAddNewEndpoint: () => void;
  handleListItemSelect: (endpoint: any) => void;
  search: string;
  setSearch: (search: string) => void;
  operation: number;
  setOperation: (operation: number) => void;
}

const SideList: FC<Props> = ({
  endpoints,
  selectedEndpoint,
  handleAddNewEndpoint,
  handleListItemSelect,
  search,
  setSearch,
  operation,
  setOperation,
}) => {
  const classes = useStyles();

  const getBadgeColor = (endpoint: any) => {
    if (endpoint.operation === OperationsEnum.POST) {
      return classes.postBadge;
    }
    if (endpoint.operation === OperationsEnum.PUT) {
      return classes.putBadge;
    }
    if (endpoint.operation === OperationsEnum.DELETE) {
      return classes.deleteBadge;
    }
    if (endpoint.operation === OperationsEnum.GET) {
      return classes.getBadge;
    }
  };

  const getOperation = (endpoint: any) => {
    if (endpoint.operation === OperationsEnum.POST) {
      return 'POST';
    }
    if (endpoint.operation === OperationsEnum.PUT) {
      return 'PUT';
    }
    if (endpoint.operation === OperationsEnum.DELETE) {
      return 'DELETE';
    }
    if (endpoint.operation === OperationsEnum.GET) {
      return 'GET';
    }
  };

  return (
    <Box>
      <Grid className={classes.actions} spacing={1} container>
        <Grid item sm={5}>
          <TextField
            variant="outlined"
            name="Search"
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
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel>Operation</InputLabel>
            <Select
              label="Provider"
              value={operation}
              onChange={(event) => setOperation(event.target.value as number)}>
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value={0}>GET</MenuItem>
              <MenuItem value={1}>POST</MenuItem>
              <MenuItem value={2}>PUT</MenuItem>
              <MenuItem value={3}>DELETE</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item sm={1}>
          <IconButton color="secondary" onClick={handleAddNewEndpoint}>
            <AddCircleOutlineIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider flexItem variant="middle" className={classes.divider} />
      <List className={classes.list}>
        {endpoints.map((endpoint: any) => (
          <ListItem
            button
            key={`endpoint-${endpoint._id}`}
            className={classes.listItem}
            onClick={() => handleListItemSelect(endpoint)}
            selected={selectedEndpoint?._id === endpoint?._id}>
            <ListItemIcon>
              <Paper elevation={12} className={getBadgeColor(endpoint)}>
                {getOperation(endpoint)}
              </Paper>
            </ListItemIcon>
            <ListItemText primary={endpoint.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SideList;
