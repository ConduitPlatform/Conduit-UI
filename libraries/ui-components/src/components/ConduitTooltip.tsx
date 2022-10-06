import React, { FC, ReactNode } from 'react';
import { Tooltip, useTheme } from '@mui/material';

interface Props {
  title: NonNullable<ReactNode>;
  children: React.ReactElement<any, any>;
  //This is the actual type for the children of the tooltip
}

const ConduitTooltip: FC<Props> = ({ children, title }) => {
  const theme = useTheme();
  return (
    <Tooltip
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            border: `1px solid ${theme.palette.primary.main}`,
            backgroundColor: `${theme.palette.background.paper}`,
            borderRadius: '24px',
            color: `${
              theme.palette.mode === 'dark'
                ? theme.palette.common.white
                : theme.palette.common.black
            }`,
            maxWidth: '500px',
          },
        },
      }}
      title={title}>
      {children}
    </Tooltip>
  );
};

export default ConduitTooltip;
