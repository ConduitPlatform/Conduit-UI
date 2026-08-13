import React, { FC } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Paginator } from '@conduitplatform/ui-components';
import { BoxProps } from '@mui/material/Box/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { Search, Refresh, CopyAllOutlined } from '@mui/icons-material';
import useParseQuery from '../../../hooks/useParseQuery';
import SchemaDataViewToggle from './SchemaDataViewToggle';
import { SchemaDataViewMode } from './schemaDataViewMode';

interface Filters {
  page: number;
  skip: number;
  limit: number;
}

interface Props extends BoxProps {
  onCreateDocument: () => void;
  onRefresh: () => void;
  onCopyPage: () => void;
  filters: Filters;
  setFilters: (data: Filters) => void;
  search: string;
  setSearch: (value: string) => void;
  count: number;
  viewMode: SchemaDataViewMode;
  onViewModeChange: (mode: SchemaDataViewMode) => void;
  disabled?: boolean;
}

const SchemaDataHeader: FC<Props> = ({
  disabled = false,
  onCreateDocument,
  onRefresh,
  onCopyPage,
  filters,
  setFilters,
  search,
  setSearch,
  count,
  viewMode,
  onViewModeChange,
  ...rest
}) => {
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
      <Box
        sx={{
          display: 'flex',
          padding: 1,
          pb: 0,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <TextField
          size="small"
          variant="outlined"
          sx={{ flex: 1, borderColor: 'red' }}
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
        <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
          <Button disabled={disabled} color="primary" size={'small'} onClick={() => onRefresh()}>
            <Refresh />
            Refresh
          </Button>
          <Button
            disabled={disabled}
            variant="contained"
            color="primary"
            size={'small'}
            onClick={() => onCreateDocument()}>
            Add Document
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pb: 2,
          gap: 1,
          flexWrap: 'wrap',
        }}>
        <SchemaDataViewToggle viewMode={viewMode} onChange={onViewModeChange} disabled={disabled} />
        {viewMode === 'json' && count > 0 && (
          <Button disabled={disabled} color="primary" size="small" onClick={onCopyPage}>
            <CopyAllOutlined />
            Copy page
          </Button>
        )}
        {count > 0 && (
          <Paginator
            handlePageChange={(event, value) => handlePageChange(value)}
            limit={filters.limit}
            handleLimitChange={handleLimitChange}
            page={filters.page}
            count={count}
          />
        )}
      </Box>
    </Box>
  );
};

export default SchemaDataHeader;
