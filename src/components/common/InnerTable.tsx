import React, { FC } from 'react';
import { Box, Chip, Collapse, TableCell, TableRow } from '@mui/material';

interface Props {
  collapsibleData?: any;
  open: boolean;
}

const InnerTable: FC<Props> = ({ collapsibleData, open }) => {
  return (
    <TableRow>
      <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              '& > *': {
                margin: 0.5,
              },
            }}>
            {Object.entries(collapsibleData).map(([key, value], innerIndex: number) =>
              Array.isArray(value) ? (
                <Box
                  key={innerIndex}
                  width="83vw"
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignContent="center"></Box>
              ) : (
                <Box
                  key={innerIndex}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    '& > *': {
                      margin: 0.5,
                    },
                  }}>
                  <Chip
                    size="small"
                    color={`primary`}
                    label={`${key}: ${value}`}
                    key={`row ${key}`}
                  />
                </Box>
              )
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

export default InnerTable;
