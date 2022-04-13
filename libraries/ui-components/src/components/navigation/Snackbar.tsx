import React, { forwardRef, useCallback } from 'react';
import { SnackbarContent, useSnackbar } from 'notistack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import { styled } from '@mui/material';

const StyledSnackbar = styled(SnackbarContent)(({ theme }) => ({
  cursor: 'pointer',
  [theme.breakpoints.up('sm')]: {
    minWidth: '300px !important',
  },
}));

type Variant = 'error' | 'info' | 'success' | 'warning';

interface IProps {
  id: string | number;
  options: {
    message: string;
    variant: Variant;
  };
}

const Snackbar = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const { closeSnackbar } = useSnackbar();

  const getVariantColor = (variant: Variant) => {
    switch (variant) {
      case 'info':
        return 'info.main';
      case 'error':
        return 'error.main';
      case 'warning':
        return 'warning.main';
      default:
        return 'success.main';
    }
  };

  const handleDismiss = useCallback(() => {
    closeSnackbar(props.id);
  }, [closeSnackbar, props.id]);

  return (
    <StyledSnackbar ref={ref} onClick={() => handleDismiss()}>
      <Card
        sx={{
          width: '100%',
          color: 'text.primary',
          backgroundColor: getVariantColor(props.options.variant),
        }}>
        <CardActions sx={{ padding: '8px 8px 8px 16px', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {props.options.message}
          </Typography>
        </CardActions>
      </Card>
    </StyledSnackbar>
  );
});

Snackbar.displayName = 'Snackbar';

export default Snackbar;
