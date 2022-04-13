import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';

interface Props {
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  handleFilterChange: (value: unknown) => void;
}

const SearchFilter: React.FC<Props> = ({ search, setSearch, filter, handleFilterChange }) => {
  return (
    <form>
      <Grid container>
        <TextField
          size="small"
          variant="outlined"
          sx={{ margin: 1 }}
          name="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          label="Find user"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl variant="outlined" sx={{ margin: 1, minWidth: 120 }} size="small">
          <InputLabel>Provider</InputLabel>
          <Select
            label="Provider"
            value={filter}
            sx={{ borderRadius: 2 }}
            onChange={(event) => handleFilterChange(event.target.value)}>
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="local">Local</MenuItem>
            <MenuItem value="google">Google</MenuItem>
            <MenuItem value="facebook">Facebook</MenuItem>
            <MenuItem value="twitch">Twitch</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </form>
  );
};

export default SearchFilter;
