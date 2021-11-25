import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import RefreshIcon from '@material-ui/icons/Refresh';
import Paginator from '../common/Paginator';
import { BoxProps } from '@material-ui/core/Box/Box';
import { makeStyles } from '@material-ui/core/styles';

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

interface Props extends BoxProps {
  onCreateDocument: () => void;
}

const SchemaDataHeader: FC<Props> = ({ onCreateDocument, ...rest }) => {
  const classes = useStyles();
  return (
    <Box {...rest}>
      <Box className={classes.topContainer}>
        <TextField label="Search" variant="outlined" className={classes.searchInput} />
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
        handlePageChange={() => console.log('handlePageChange')}
        limit={25}
        handleLimitChange={() => console.log('handleLimitChange')}
        page={0}
        count={5}
        className={classes.paginator}
      />
    </Box>
  );
};

export default SchemaDataHeader;
