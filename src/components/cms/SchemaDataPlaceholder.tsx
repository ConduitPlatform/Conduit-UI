import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { BoxProps } from '@material-ui/core/Box/Box';
import { makeStyles } from '@material-ui/core/styles';

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
