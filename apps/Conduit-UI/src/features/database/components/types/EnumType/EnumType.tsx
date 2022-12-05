import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { FieldIndicators } from '@conduitplatform/ui-components';
import SelectIcon from '@mui/icons-material/FormatListBulleted';
import Grid from '@mui/material/Grid';
import { CustomIcon } from '../SimpleType/SimpleType';
// import { IEnumData } from '../../../../models/cms/BuildTypesModels';

interface IProps {
  item: any; //todo add IEnumData;
}

const EnumType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <>
      <Grid item container xs={1}>
        <CustomIcon>
          <SelectIcon />
        </CustomIcon>
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

export default EnumType;

export const EnumGroupType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <>
      <Grid item container xs={1}>
        <CustomIcon>
          <SelectIcon />
        </CustomIcon>
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
