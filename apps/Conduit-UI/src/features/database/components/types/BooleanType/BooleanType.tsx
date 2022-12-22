import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { FieldIndicators } from '@conduitplatform/ui-components';
import { IBooleanData } from '../../../models/BuildTypesModels';
import { Tooltip } from '@mui/material';

interface IProps {
  item: IBooleanData;
}

const BooleanType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest} display="flex" alignItems="center" justifyContent="space-between">
      <Box display={'flex'} alignItems={'center'}>
        <Tooltip title={`Boolean type: ${item.default ? 'true' : 'false'}`}>
          <Switch disabled checked={item.default} value="Boolean" />
        </Tooltip>
      </Box>
      <Box display={'flex'} alignItems={'center'} gap={1}>
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default BooleanType;
