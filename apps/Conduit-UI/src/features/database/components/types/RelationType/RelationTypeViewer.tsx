import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { FieldIndicators } from '@conduitplatform/ui-components';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import { IRelationData } from '../../../models/BuildTypesModels';
import { CustomIcon } from '../SimpleType/SimpleType';

interface IProps {
  item: IRelationData;
}

const RelationTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box display="flex" justifyContent="space-between">
      <CustomIcon>
        <DeviceHubIcon />
      </CustomIcon>
      <Box display="flex">
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default RelationTypeViewer;
