import React, { FC } from 'react';
import Box from '@mui/material/Box';
import CodeIcon from '@mui/icons-material/Code';
import Tooltip from '@mui/material/Tooltip';
import { FieldIndicators } from '@conduitplatform/ui-components';

import { IObjectData } from '../../../models/BuildTypesModels';
import { CustomIcon } from '../SimpleType/SimpleType';

interface IProps {
  item: IObjectData;
}

const ObjectIdType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest} display="flex" justifyContent="space-between" alignItems="center">
      <Box display={'flex'} alignItems={'center'}>
        <Tooltip title={'ObjectId field'}>
          <CustomIcon>
            <CodeIcon />
          </CustomIcon>
        </Tooltip>
      </Box>
      <Box display={'flex'} alignItems={'center'} gap={1}>
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default ObjectIdType;

export const ObjectIdGroupType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest} display="flex" justifyContent="space-between" alignItems="center">
      <Box display={'flex'} alignItems={'center'}>
        <Tooltip title={'ObjectId field'}>
          <CustomIcon>
            <CodeIcon />
          </CustomIcon>
        </Tooltip>
      </Box>
      <Box display={'flex'} alignItems={'center'} gap={1}>
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};
