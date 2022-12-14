import React, { FC } from 'react';
import Box from '@mui/material/Box';
import CodeIcon from '@mui/icons-material/Code';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Grid from '@mui/material/Grid';
import { IObjectData } from '../../../models/BuildTypesModels';
import { CustomIcon } from '../SimpleType/SimpleType';

interface IProps {
  item: IObjectData;
}

const ObjectIdTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <>
      <Grid item container xs={1}>
        <CustomIcon>
          <CodeIcon />
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

export default ObjectIdTypeViewer;

export const ObjectIdGroupTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <>
      <Grid item container xs={1}>
        <CustomIcon>
          <CodeIcon />
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
