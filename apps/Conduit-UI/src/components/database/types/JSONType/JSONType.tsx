import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Grid from '@mui/material/Grid';
import { Icon, styled } from '@mui/material';
import { IntegrationInstructionsRounded } from '@mui/icons-material';

export const CustomIcon = styled(Icon)(({ theme }) => ({
  height: theme.spacing(3),
  width: theme.spacing(3),
  marginRight: theme.spacing(1),
  opacity: 0.6,
  display: 'flex',
  alignItems: 'center',
}));

interface IProps {
  item: any; //todo add ISimpleData;
}

const JSONType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid item xs={6}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'JSON field'}>
              <CustomIcon>
                <IntegrationInstructionsRounded />
              </CustomIcon>
            </Tooltip>
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              simple placeholder
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} justifyContent={'flex-end'} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JSONType;

export const JSONGroupType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid item xs={6}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'JSON field'}>
              <CustomIcon>
                <IntegrationInstructionsRounded />
              </CustomIcon>
            </Tooltip>
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              simple placeholder
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} justifyContent={'flex-end'} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
