import React, { FC } from 'react';
import Box from '@mui/material/Box';
import TextIcon from '@mui/icons-material/Title';
import NumberIcon from '@mui/icons-material/Filter7';
import DateIcon from '@mui/icons-material/DateRange';
import Tooltip from '@mui/material/Tooltip';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Grid from '@mui/material/Grid';
import { ISimpleDataTypes } from '../../../models/BuildTypesModels';
import { CustomIcon } from './SimpleType';

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

const SimpleTypeViewer: FC<IProps> = ({ item }) => {
  return (
    <>
      <Grid item container xs={1}>
        <SimpleIcon type={item.type} />
      </Grid>
      <Grid item container justifyContent="flex-end" xs={5}>
        <Grid item xs={6}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default SimpleTypeViewer;

export const SimpleGroupTypeViewer: FC<IProps> = ({ item }) => {
  return (
    <>
      <Grid item container xs={1}>
        <SimpleIcon type={item.type} />
      </Grid>
      <Grid item container justifyContent="flex-end" xs={5}>
        <Grid item xs={6}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </>
  );
};
