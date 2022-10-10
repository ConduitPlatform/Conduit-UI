import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { FC } from 'react';
import Lottie from 'react-lottie';

interface Props {
  small?: boolean;
  lottieFile: any;
}

const LottieForWidget: FC<Props> = ({ small, lottieFile }) => {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.only('xs'));
  const sm = useMediaQuery(theme.breakpoints.only('sm'));
  const md = useMediaQuery(theme.breakpoints.only('md'));
  const lg = useMediaQuery(theme.breakpoints.only('lg'));

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: lottieFile,
  };

  const extractSizing = () => {
    if (small) {
      if (xs || sm) {
        return 16;
      } else if (md) {
        return 19;
      } else if (lg) {
        return 28;
      } else {
        return 30;
      }
    } else if (xs || sm) {
      return 24;
    } else if (md) {
      return 26;
    } else if (lg) {
      return 32;
    } else {
      return 38;
    }
  };

  return <Lottie options={defaultOptions} height={extractSizing()} width={extractSizing()} />;
};

export default LottieForWidget;
