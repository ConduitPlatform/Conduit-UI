import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { BoxProps } from '@mui/material/Box/Box';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  emptyDocuments: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
  },
}));

interface Props extends BoxProps {
  onCreateDocument: () => void;
}

const SchemaDataPlaceholder: FC<Props> = ({ onCreateDocument, ...rest }) => {
  const classes = useStyles();
  return (
    <Box className={classes.emptyDocuments} {...rest}>
      <p>No documents are available.</p>
      <Button variant="contained" color="primary" onClick={() => onCreateDocument()}>
        Add Document
      </Button>
    </Box>
  );
};

export default SchemaDataPlaceholder;
