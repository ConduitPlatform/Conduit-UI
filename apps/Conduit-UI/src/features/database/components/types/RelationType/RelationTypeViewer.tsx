import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { FieldIndicators } from '@conduitplatform/ui-components';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import { IRelationData } from '../../../models/BuildTypesModels';
import { CustomIcon } from '../SimpleType/SimpleType';
import { Tooltip } from '@mui/material';

interface IProps {
  item: IRelationData;
}

const RelationTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box display="flex" justifyContent="space-between">
      <Tooltip title="Relation type">
        <CustomIcon>
          <DeviceHubIcon />
        </CustomIcon>
      </Tooltip>
      <Box display="flex">
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default RelationTypeViewer;
