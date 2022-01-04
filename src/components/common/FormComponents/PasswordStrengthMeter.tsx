import React, { FC, useMemo } from 'react';
import { Box, Slider, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getPasswordStrength } from '../../../utils/getPasswordStrength';

const useStyles = makeStyles(() => ({
  root: {
    color: (props: { colorValue: string }) => props.colorValue,
    '& .MuiSlider-thumb': {
      display: 'none',
    },
    '& .MuiSlider-rail': {
      height: '15px',
    },
    '& .MuiSlider-track': {
      height: '15px',
    },
  },
}));

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrengthMeter: FC<PasswordStrengthProps> = ({ password }) => {
  const passwordState = useMemo(() => {
    const strength = getPasswordStrength(password);
    if (strength == 1) return { color: 'orangered', percentage: 30, message: 'password is weak' };
    if (strength == 2) return { color: '#8FCA11', percentage: 70, message: 'password is moderate' };
    if (strength == 3) return { color: 'green', percentage: 100, message: 'password is strong' };
    return { color: 'red', percentage: 0, message: 'password is very weak' };
  }, [password]);

  const classes = useStyles({ colorValue: passwordState.color });

  return (
    <Box>
      <Slider classes={{ root: classes.root }} value={passwordState.percentage} />
      <Typography variant={'subtitle2'} style={{ color: passwordState.color }} align={'center'}>
        {passwordState.message}
      </Typography>
    </Box>
  );
};

export default PasswordStrengthMeter;
