import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import makeStyles from '@mui/styles/makeStyles';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  handleFilterChange: (value: unknown) => void;
}

const SearchFilter: React.FC<Props> = ({ search, setSearch, filter, handleFilterChange }) => {
  const classes = useStyles();

  return (
    <form>
      <Grid container>
        <TextField
          size="small"
          variant="outlined"
          className={classes.margin}
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
        <FormControl variant="outlined" className={classes.formControl} size="small">
          <InputLabel>Provider</InputLabel>
          <Select
            label="Provider"
            value={filter}
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
