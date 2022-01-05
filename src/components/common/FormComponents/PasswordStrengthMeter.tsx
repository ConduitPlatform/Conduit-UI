import React, { FC, memo, useEffect, useState } from 'react';
import { Box, Slider, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getPasswordStrength } from '../../../utils/getPasswordStrength';

const useStyles = makeStyles(() => ({
  root: {
    pointerEvents: 'none',
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
  const [passwordState, setPasswordState] = useState({
    color: 'red',
    percentage: 0,
    message: 'password is very weak',
  });
  const classes = useStyles({ colorValue: passwordState.color });

  useEffect(() => {
    const strength = getPasswordStrength(password);
    let temp = { color: 'red', percentage: 0, message: 'password is very weak' };
    if (strength == 1) temp = { color: 'orangered', percentage: 30, message: 'password is weak' };
    if (strength == 2) temp = { color: '#8FCA11', percentage: 70, message: 'password is moderate' };
    if (strength == 3) temp = { color: 'green', percentage: 100, message: 'password is strong' };
    setPasswordState(temp);
  }, [password]);

  return (
    <Box>
      <Slider classes={{ root: classes.root }} value={passwordState.percentage} />
      <Typography variant={'subtitle2'} style={{ color: passwordState.color }} align={'center'}>
        {passwordState.message}
      </Typography>
    </Box>
  );
};

export default memo(PasswordStrengthMeter);
