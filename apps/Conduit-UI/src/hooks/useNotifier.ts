import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { addSnackbar, INotification, removeSnackbar } from '../redux/slices/appSlice';
import { v4 as uuidv4 } from 'uuid';

const useNotifier = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.appSlice || []);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    notifications.forEach(({ options, message }: INotification) => {
      enqueueSnackbar(message, options);
      dispatch(removeSnackbar(options.key));
    });
  }, [dispatch, enqueueSnackbar, notifications]);
};

export default useNotifier;

export const enqueueErrorNotification = (message: string, optionalKey?: string) => {
  const messageObj = { variant: 'error', message: message ? message : 'Something went wrong' };
  return addSnackbar({
    message: JSON.stringify(messageObj),
    options: {
      key: optionalKey ? optionalKey : uuidv4(),
      variant: 'error',
      autoHideDuration: 2000,
      preventDuplicate: true,
    },
  });
};

export const enqueueInfoNotification = (message: string, optionalKey?: string) => {
  const messageObj = { variant: 'info', message: message ? message : 'Info' };
  return addSnackbar({
    message: JSON.stringify(messageObj),
    options: {
      key: optionalKey ? optionalKey : uuidv4(),
      variant: 'info',
      autoHideDuration: 2000,
      preventDuplicate: true,
    },
  });
};

export const enqueueSuccessNotification = (message: string) => {
  const messageObj = { variant: 'success', message: message ? message : 'Success' };
  return addSnackbar({
    message: JSON.stringify(messageObj),
    options: {
      key: uuidv4(),
      variant: 'success',
      autoHideDuration: 2000,
    },
  });
};
