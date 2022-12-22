import React, { FC } from 'react';
import Box from '@mui/material/Box';
import CodeIcon from '@mui/icons-material/Code';
import { FieldIndicators } from '@conduitplatform/ui-components';
import { IObjectData } from '../../../models/BuildTypesModels';
import { CustomIcon } from '../SimpleType/SimpleType';
import { Tooltip } from '@mui/material';

interface IProps {
  item: IObjectData;
}

const ObjectIdTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box display="flex" justifyContent="space-between">
      <Tooltip title="Object ID field">
        <CustomIcon>
          <CodeIcon />
        </CustomIcon>
      </Tooltip>
      <Box display="flex">
        <FieldIndicators item={item} />
      </Box>
    </Box>
  );
};

export default ObjectIdTypeViewer;
