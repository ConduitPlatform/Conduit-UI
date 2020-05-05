import { Layout } from '../components/Layout';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CustomTabs from '../components/CustomTabs';
import React, { useEffect, useState } from 'react';
import { privateRoute } from '../components/utils/privateRoute';
import StorageFiles from '../components/StorageFiles';
import StorageSettings from '../components/StorageSettings';
import { useDispatch, useSelector } from 'react-redux';
import { saveStorageConfig } from '../redux/thunks/storageThunks';
import { getStorageConfig } from '../redux/thunks/storageThunks';
import Snackbar from '@material-ui/core/Snackbar';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));
const tabs = [{ title: 'Files' }, { title: 'Settings' }];

const Storage = () => {
  const classes = useStyles();
  const [selected, setSelected] = useState(0);
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.storageReducer);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    dispatch(getStorageConfig());
  }, []);

  useEffect(() => {
    if (error) {
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleChange = (event, newValue) => {
    setSelected(newValue);
  };

  const handleStorageSettings = (data) => {
    dispatch(saveStorageConfig(data));
  };

  const snackbarAlert = () => {
    if (error) {
      return (
        <Alert variant={'filled'} onClose={handleClose} severity="error">
          Something went wrong!
        </Alert>
      );
    } else {
      return undefined;
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Layout itemSelected={5}>
      <Box p={2}>
        <Typography variant={'h4'}>Storage</Typography>
        <CustomTabs tabs={tabs} selected={selected} handleChange={handleChange} />
        <Box role="tabpanel" hidden={selected !== 0} id={`tabpanel-0`}>
          <StorageFiles />
        </Box>
        <Box role="tabpanel" hidden={selected !== 1} id={`tabpanel-1`}>
          <StorageSettings config={data.config} handleSave={handleStorageSettings} />
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snackbarAlert()}
      </Snackbar>
      <Backdrop open={loading} className={classes.backdrop}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </Layout>
  );
};

export default privateRoute(Storage);
