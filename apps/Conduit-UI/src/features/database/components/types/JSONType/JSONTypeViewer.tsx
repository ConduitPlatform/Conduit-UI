import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { FieldIndicators } from '@conduitplatform/ui-components';
import { CustomIcon } from '../SimpleType/SimpleType';
import { IntegrationInstructionsRounded } from '@mui/icons-material';

interface IProps {
  item: any; //todo add ISimpleData;
}

const JSONTypeViewer: FC<IProps> = ({ item }) => {
  return (
    <Box display="flex" justifyContent="space-between">
      <Tooltip title={'JSON field'}>
        <CustomIcon>
          <IntegrationInstructionsRounded />
        </CustomIcon>
      </Tooltip>
      <Box display="flex" gap={1}>
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default JSONTypeViewer;
