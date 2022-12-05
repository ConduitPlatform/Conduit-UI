import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { BoxProps } from '@mui/material/Box/Box';

interface Props extends BoxProps {
  onCreateDocument: () => void;
}

const SchemaDataPlaceholder: FC<Props> = ({ onCreateDocument, ...rest }) => {
  return (
    <Box
      sx={{
        marginTop: 4,
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'center',
      }}
      {...rest}>
      <p>No documents are available.</p>
      <Button variant="contained" color="primary" onClick={() => onCreateDocument()}>
        Add Document
      </Button>
    </Box>
  );
};

export default SchemaDataPlaceholder;
