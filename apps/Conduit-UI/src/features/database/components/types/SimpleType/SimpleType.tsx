import React, { FC } from 'react';
import Box from '@mui/material/Box';
import TextIcon from '@mui/icons-material/Title';
import NumberIcon from '@mui/icons-material/Filter7';
import DateIcon from '@mui/icons-material/DateRange';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Grid from '@mui/material/Grid';
import { ISimpleDataTypes } from '../../../models/BuildTypesModels';
import { Icon, styled } from '@mui/material';

export const CustomIcon = styled(Icon)(({ theme }) => ({
  height: theme.spacing(3),
  width: theme.spacing(3),
  marginRight: theme.spacing(1),
  opacity: 0.6,
  display: 'flex',
  alignItems: 'center',
}));

interface ISimpleIconProps {
  type: ISimpleDataTypes;
}

const SimpleIcon: FC<ISimpleIconProps> = ({ type }) => {
  switch (type) {
    case 'Text':
      return (
        <Tooltip title={'Text field'}>
          <CustomIcon>
            <TextIcon />
          </CustomIcon>
        </Tooltip>
      );
    case 'Number':
      return (
        <Tooltip title={'Number field'}>
          <CustomIcon>
            <NumberIcon />
          </CustomIcon>
        </Tooltip>
      );
    case 'Date':
      return (
        <Tooltip title={'Date field'}>
          <CustomIcon>
            <DateIcon />
          </CustomIcon>
        </Tooltip>
      );
    default:
      return <></>;
  }
};

interface IProps {
  item: any; //todo add ISimpleData;
}

const SimpleType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid item xs={6}>
          <Box display={'flex'} alignItems={'center'}>
            <SimpleIcon type={item.type} />
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              simple placeholder
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} justifyContent={'flex-end'} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimpleType;

export const SimpleGroupType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid item xs={6}>
          <Box display={'flex'} alignItems={'center'}>
            <SimpleIcon type={item.type} />
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              simple placeholder
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} justifyContent={'flex-end'} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
