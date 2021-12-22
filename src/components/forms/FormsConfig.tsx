import { Container } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import { FormsConfig } from '../../models/forms/FormsModels';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncEditFormsConfig } from '../../redux/slices/formsSlice';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  innerGrid: {
    paddingLeft: theme.spacing(4),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
  marginRight: {
    marginRight: '16px',
  },
}));

const FormsConfig: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [edit, setEdit] = useState<boolean>(false);
  const { config: formsConfig } = useAppSelector((state) => state.formsSlice.data);

  const methods = useForm<FormsConfig>({
    defaultValues: useMemo(() => {
      return formsConfig;
    }, [formsConfig]),
  });
  const { reset, control } = methods;

  useEffect(() => {
    reset(formsConfig);
  }, [formsConfig, reset]);

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const handleCancel = () => {
    setEdit(false);
    reset();
  };

  const handleEditClick = () => {
    setEdit(true);
  };

  const onSubmit = (data: FormsConfig) => {
    setEdit(false);
    const config = {
      ...formsConfig,
      ...data,
    };
    dispatch(asyncEditFormsConfig(config));
  };

  return (
    <Container>
      <Paper className={classes.paper}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container>
              <Box
                width={'100%'}
                display={'inline-flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'h6'}>Activate Forms Module</Typography>
                <FormInputSwitch disabled={!edit} name={'active'} />
              </Box>

              <Divider className={classes.divider} />

              <Grid container spacing={2} className={classes.innerGrid}>
                {isActive && (
                  <Grid item xs={12}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'h6'}>Use Attachments</Typography>
                      <FormInputSwitch disabled={!edit} name={'useAttachments'} />
                    </Box>
                  </Grid>
                )}
              </Grid>
              {edit && (
                <Grid item container xs={12} justifyContent={'flex-end'}>
                  <Button
                    onClick={() => handleCancel()}
                    className={classes.marginRight}
                    color={'primary'}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    className={classes.alignEnd}>
                    Save
                  </Button>
                </Grid>
              )}
              {!edit && (
                <Grid item container xs={12} justifyContent={'flex-end'}>
                  <Button
                    onClick={() => handleEditClick()}
                    className={classes.marginRight}
                    color={'primary'}>
                    Edit
                  </Button>
                </Grid>
              )}
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default FormsConfig;
