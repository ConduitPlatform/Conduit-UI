import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
import styled from '@emotion/styled';

const CustomizedTypography = styled(Typography)(() => ({
  height: 25,
  width: 25,
  marginRight: 5,
  opacity: 0.6,
  display: 'flex',
  alignItems: 'center',
}));

interface Props {
  item: {
    isArray?: boolean;
    name: string;
    required: boolean;
    select: boolean;
    type: string;
    unique?: boolean;
  };
}

const FieldIndicators: FC<Props> = ({ item }) => {
  return (
    <>
      {item.required && (
        <Tooltip title={'Required field'}>
          <CustomizedTypography variant={'h6'}>R</CustomizedTypography>
        </Tooltip>
      )}
      {item.unique && (
        <Tooltip title={'Unique field'}>
          <CustomizedTypography variant={'h6'}>U</CustomizedTypography>
        </Tooltip>
      )}
      {item.select && (
        <Tooltip title={'Selected field'}>
          <CustomizedTypography variant={'h6'}>S</CustomizedTypography>
        </Tooltip>
      )}
      {item.isArray && (
        <Tooltip title={'Array of selected type'}>
          <CustomizedTypography variant={'h6'}>A</CustomizedTypography>
        </Tooltip>
      )}
    </>
  );
};

export default FieldIndicators;
