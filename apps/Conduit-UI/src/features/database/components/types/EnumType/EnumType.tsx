import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { FieldIndicators } from '@conduitplatform/ui-components';
import SelectIcon from '@mui/icons-material/FormatListBulleted';
import { CustomIcon } from '../SimpleType/SimpleType';
// import { IEnumData } from '../../../../models/cms/BuildTypesModels';

interface IProps {
  item: any; //todo add IEnumData;
}

const EnumType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box display="flex" justifyContent="space-between">
      <CustomIcon>
        <SelectIcon />
      </CustomIcon>
      <Box display="flex" alignItems="center">
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default EnumType;
