import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import RefreshIcon from '@material-ui/icons/Refresh';
import Paginator from '../common/Paginator';
import { BoxProps } from '@material-ui/core/Box/Box';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
  topContainer: {
    display: 'flex',
    padding: theme.spacing(1),
    paddingBottom: 0,
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
  },
  divider: {
    width: theme.spacing(1),
  },
  paginator: {
    borderBottom: '1px solid rgb(255 255 255 / 12%)',
  },
}));

interface Filters {
  page: number;
  skip: number;
  limit: number;
}

interface Props extends BoxProps {
  onCreateDocument: () => void;
  filters: Filters;
  setFilters: (data: Filters) => void;
  search: string;
  setSearch: (value: string) => void;
  count: number;
}

const SchemaDataHeader: FC<Props> = ({
  onCreateDocument,
  filters,
  setFilters,
  search,
  setSearch,
  count,
  ...rest
}) => {
  const classes = useStyles();

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
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box className={classes.divider} />
        <Button variant="contained" color="secondary" onClick={() => console.log('refresh')}>
          <RefreshIcon />
          Refresh
        </Button>
        <Box className={classes.divider} />
        <Button variant="contained" color="primary" onClick={() => onCreateDocument()}>
          Add Document
        </Button>
      </Box>
      <Paginator
        handlePageChange={(event, value) => handlePageChange(value)}
        limit={filters.limit}
        handleLimitChange={handleLimitChange}
        page={filters.page}
        count={count}
        className={classes.paginator}
      />
    </Box>
  );
};

export default SchemaDataHeader;
