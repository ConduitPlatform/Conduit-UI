import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paginator from '../../common/Paginator';
import { BoxProps } from '@material-ui/core/Box/Box';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Search, Refresh, AccountTree } from '@material-ui/icons';
import useParseQuery from './useParseQuery';
import { Typography } from '@material-ui/core';
import clsx from 'clsx';

const ObjText = '{ }';

const useStyles = makeStyles((theme) => ({
  topContainer: {
    display: 'flex',
    padding: theme.spacing(1),
    paddingBottom: 0,
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
    borderColor: 'red',
  },
  divider: {
    width: theme.spacing(1),
  },
  paginator: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid rgb(255 255 255 / 12%)',
  },
  buttonContainer: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    borderRadius: theme.spacing(0.5),
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
    marginLeft: theme.spacing(1),
  },
  objText: {
    whiteSpace: 'nowrap',
    fontSize: 14,
  },
  selected: {
    color: theme.palette.primary.main,
  },
}));

interface Filters {
  page: number;
  skip: number;
  limit: number;
}

interface Props extends BoxProps {
  onCreateDocument: () => void;
  onRefresh: () => void;
  filters: Filters;
  setFilters: (data: Filters) => void;
  search: string;
  setSearch: (value: string) => void;
  count: number;
  objectView: boolean;
  setObjectView: (value: boolean) => void;
}

const SchemaDataHeader: FC<Props> = ({
  onCreateDocument,
  onRefresh,
  filters,
  setFilters,
  search,
  setSearch,
  count,
  objectView,
  setObjectView,
  ...rest
}) => {
  const classes = useStyles();

  const isValidSearch = useParseQuery(search, 0);

  const isSearchError = () => {
    if (search && Object.keys(isValidSearch).length === 0) return true;
  };

  const handleLimitChange = (value: number) => {
    setFilters({
      ...filters,
      limit: value,
      skip: 0,
      page: 0,
    });
  };

  const handlePageChange = (value: number) => {
    if (value > filters.page) {
      setFilters({
        ...filters,
        page: filters.page + 1,
        skip: filters.skip + filters.limit,
      });
    } else {
      setFilters({
        ...filters,
        page: filters.page - 1,
        skip: filters.skip - filters.limit,
      });
    }
  };

  return (
    <Box {...rest}>
      <Box className={classes.topContainer}>
        <TextField
          size="small"
          variant="outlined"
          className={classes.searchInput}
          name="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          label="search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          error={isSearchError()}
        />
        <Box className={classes.divider} />
        <Button color="secondary" size={'small'} onClick={() => onRefresh()}>
          <Refresh />
          Refresh
        </Button>
        <Box className={classes.divider} />
        <Button
          variant="contained"
          color="primary"
          size={'small'}
          onClick={() => onCreateDocument()}>
          Add Document
        </Button>
      </Box>
      <Box className={classes.paginator}>
        <Box className={classes.buttonContainer} onClick={() => setObjectView(false)}>
          <AccountTree color={objectView ? 'inherit' : 'primary'} />
        </Box>
        <Box className={classes.buttonContainer} onClick={() => setObjectView(true)}>
          <Typography
            className={objectView ? clsx(classes.objText, classes.selected) : classes.objText}>
            {ObjText}
          </Typography>
        </Box>
        <Paginator
          handlePageChange={(event, value) => handlePageChange(value)}
          limit={filters.limit}
          handleLimitChange={handleLimitChange}
          page={filters.page}
          count={count}
        />
      </Box>
    </Box>
  );
};

export default SchemaDataHeader;