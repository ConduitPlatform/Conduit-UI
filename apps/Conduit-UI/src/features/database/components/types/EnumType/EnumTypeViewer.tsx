import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Tooltip from '@mui/material/Tooltip';
import SelectIcon from '@mui/icons-material/FormatListBulleted';
import { CustomIcon } from '../SimpleType/SimpleType';

interface IProps {
  item: any; //todo add IEnumData;
}

const EnumTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Tooltip title={'Enum field'}>
        <CustomIcon>
          <SelectIcon />
        </CustomIcon>
      </Tooltip>
      <Box display="flex" alignItems="center">
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default EnumTypeViewer;
