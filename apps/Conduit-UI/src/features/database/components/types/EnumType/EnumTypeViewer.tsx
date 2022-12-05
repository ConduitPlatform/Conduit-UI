import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import SelectIcon from '@mui/icons-material/FormatListBulleted';
import Grid from '@mui/material/Grid';
import { CustomIcon } from '../SimpleType/SimpleType';
// import { IEnumData } from '../../../../models/cms/BuildTypesModels';

interface IProps {
  item: any; //todo add IEnumData;
}

const EnumTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Grid item xs={6} alignItems={'center'}>
      <Box display={'flex'} alignItems={'center'}>
        <Tooltip title={'Enum field'}>
          <CustomIcon>
            <SelectIcon />
          </CustomIcon>
        </Tooltip>
        <FieldIndicators item={item} />
      </Box>
    </Grid>
  );
};

export default EnumTypeViewer;

export const EnumGroupTypeViewer: FC<IProps> = ({ item }) => {
  return (
    <Grid item xs={6} alignItems={'center'}>
      <Box display={'flex'} alignItems={'center'}>
        <Tooltip title={'Enum field'}>
          <CustomIcon>
            <SelectIcon />
          </CustomIcon>
        </Tooltip>
        <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
          enum placeholder
        </Typography>
        <FieldIndicators item={item} />
      </Box>
    </Grid>
  );
};
