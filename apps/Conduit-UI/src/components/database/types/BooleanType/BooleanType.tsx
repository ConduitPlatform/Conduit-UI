import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { FieldIndicators } from '@conduitplatform/ui-components';
import { IBooleanData } from '../../../../models/database/BuildTypesModels';

interface IProps {
  item: IBooleanData;
}

const BooleanType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest} display="flex" alignItems="center" justifyContent="center">
      <Box display={'flex'} alignItems={'center'}>
        <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
          {item.placeholderFalse}
        </Typography>
        <Switch disabled checked={item.default} value="Boolean" />
        <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
          {item.placeholderTrue}
        </Typography>
      </Box>
      <Box display={'flex'} alignItems={'center'} gap={1}>
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default BooleanType;

export const BooleanGroupType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest} display="flex" alignItems="center" justifyContent="center">
      <Box display={'flex'} alignItems={'center'}>
        <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
          {item.placeholderFalse}
        </Typography>
        <Switch disabled checked={item.default} value="Boolean" />
        <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
          {item.placeholderTrue}
        </Typography>
      </Box>
      <Box display={'flex'} alignItems={'center'} gap={1}>
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};
