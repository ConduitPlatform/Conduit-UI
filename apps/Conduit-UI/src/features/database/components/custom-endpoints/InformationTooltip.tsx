import React from 'react';
import { ConduitTooltip } from '@conduitplatform/ui-components';
import { Box, Typography, Icon } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

const InformationTooltip = () => {
  return (
    <ConduitTooltip
      title={
        <Box display="flex" flexDirection="column" gap={2} p={2}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex">
              <Typography variant="caption">
                <u>Authenticated</u> defines whether endpoint requires user authentication
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="caption">
                <u>Paginated</u> defines whether endpoint should provide pagination (skip/limit)
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="caption">
                <u>Sorted</u> defines whether results should be sorted
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column">
              <Typography variant="caption">
                <a
                  href="https://www.w3schools.com/sql/sql_like.asp"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit' }}>
                  {` SQL LIKE Operator`}
                </a>
                {` is used in a WHERE clause to search for a specified pattern in a
              column`}
              </Typography>
            </Box>
          </Box>
        </Box>
      }>
      <Icon sx={{ display: 'flex' }}>
        <InfoOutlined />
      </Icon>
    </ConduitTooltip>
  );
};

export default InformationTooltip;
