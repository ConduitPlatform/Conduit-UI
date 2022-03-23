import React, { forwardRef, useCallback } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { SnackbarContent, useSnackbar } from 'notistack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    cursor: 'pointer',
    [theme.breakpoints.up('sm')]: {
      minWidth: '300px !important',
    },
  },
  card: {
    width: '100%',
  },
  typography: {
    fontWeight: 'bold',
  },
  actionRoot: {
    padding: '8px 8px 8px 16px',
    justifyContent: 'space-between',
  },
  icons: {
    marginLeft: 'auto',
  },
  error: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.text.primary,
  },
  success: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.text.primary,
  },
  info: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.text.primary,
  },
  warning: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.text.primary,
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
  const classes = useStyles();
  const { closeSnackbar } = useSnackbar();

  const getVariantColor = (variant: Variant) => {
    switch (variant) {
      case 'info':
        return classes.info;
      case 'error':
        return classes.error;
      case 'warning':
        return classes.warning;
      default:
        return classes.success;
    }
  };

  const handleDismiss = useCallback(() => {
    closeSnackbar(props.id);
  }, [closeSnackbar, props.id]);

  return (
    <SnackbarContent ref={ref} className={classes.root} onClick={() => handleDismiss()}>
      <Card className={clsx(classes.card, getVariantColor(props.options.variant))}>
        <CardActions classes={{ root: classes.actionRoot }}>
          <Typography variant="subtitle2" className={classes.typography}>
            {props.options.message}
          </Typography>
        </CardActions>
      </Card>
    </SnackbarContent>
  );
});

Snackbar.displayName = 'Snackbar';

export default Snackbar;
