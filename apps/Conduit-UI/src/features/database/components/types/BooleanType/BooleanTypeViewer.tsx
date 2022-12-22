import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import { FieldIndicators } from '@conduitplatform/ui-components';
import { IBooleanData } from '../../../models/BuildTypesModels';

interface IProps {
  item: IBooleanData;
}

const BooleanTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box display="flex" justifyContent="space-between">
      <Switch disabled sx={{ ml: -1 }} checked={item.default} value="Boolean" />
      <Box display="flex">
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default BooleanTypeViewer;
