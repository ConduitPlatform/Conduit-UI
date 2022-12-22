import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { FieldIndicators } from '@conduitplatform/ui-components';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import { IRelationData } from '../../../models/BuildTypesModels';
import { CustomIcon } from '../SimpleType/SimpleType';

interface IProps {
  item: IRelationData;
}

const RelationType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest} display="flex" justifyContent="space-between">
      <CustomIcon>
        <DeviceHubIcon />
      </CustomIcon>
      <Box display="flex" alignItems="center">
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default RelationType;
