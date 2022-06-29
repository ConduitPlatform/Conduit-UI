import { Container, Typography, Paper, Grid, Button, Box } from '@mui/material';
import React, { FC, useCallback, useState } from 'react';
import { NotificationsOutlined, Send } from '@mui/icons-material';
import { FormProvider, useForm } from 'react-hook-form';
import { useAppSelector } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { asyncGetAuthUserData } from '../../redux/slices/authenticationSlice';
import { AuthUser, AuthUserUI } from '../../models/authentication/AuthModels';
import TableDialog from '../common/TableDialog';
import { SelectedElements } from '@conduitplatform/ui-components';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { NotificationData } from '../../models/notifications/NotificationModels';
import { Pagination, Search } from '../../models/http/HttpModels';

type SendNotificationProps = {
  handleSend: (value: NotificationData) => void;
};

interface NotificationInputs {
  title: string;
  body: string;
}

const defaultValues = {
  title: '',
  body: '',
};

const SendNotificationForm: FC<SendNotificationProps> = ({ handleSend }) => {
  const dispatch = useDispatch();
  const methods = useForm<NotificationInputs>({ defaultValues: defaultValues });
  const [drawer, setDrawer] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<AuthUserUI[]>([]);
  const { users, count } = useAppSelector((state) => state.authenticationSlice.data.authUsers);

  const getData = useCallback(
    (params: Pagination & Search & { provider: string }) => {
      dispatch(asyncGetAuthUserData(params));
    },
    [dispatch]
  );

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Email', sort: 'email' },
    { title: 'Active', sort: 'active' },
    { title: 'Verified', sort: 'isVerified' },
    { title: 'Registered At', sort: 'createdAt' },
  ];
  const formatData = (usersToFormat: AuthUser[]) => {
    return usersToFormat.map((u) => {
      return {
        _id: u._id,
        Email: u.email ? u.email : 'N/A',
        Active: u.active,
        Verified: u.isVerified,
        'Registered At': u.createdAt,
      };
    });
  };

  const onSubmit = (data: NotificationInputs) => {
    const selectedIds = selectedUsers.map((user) => user._id);
    const dataToSend = { ...data, userIds: selectedIds };
    handleSend(dataToSend);
  };

  const removeSelectedUser = (i: number) => {
    const filteredArray = selectedUsers.filter((user, index) => index !== i);
    setSelectedUsers(filteredArray);
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 2, color: 'text.primary', borderRadius: 8 }} elevation={5}>
        <Typography variant={'h6'} sx={{ mb: 4 }}>
          <NotificationsOutlined fontSize={'small'} style={{ marginBottom: '-2px' }} /> Push
          notifications
        </Typography>
        <FormProvider {...methods}>
          <form noValidate autoComplete="off" onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Box sx={{ padding: 3 }}>
                <SelectedElements
                  selectedElements={selectedUsers.map((user) => user.Email)}
                  handleButtonAction={() => setDrawer(true)}
                  removeSelectedElement={removeSelectedUser}
                  buttonText={'Add users'}
                  header={'Selected users'}
                />
              </Box>
              <Grid item xs={12}>
                <FormInputText name="title" label="title" />
              </Grid>
              <Grid item xs={12}>
                <FormInputText name="body" rows={10} label="Body" />
              </Grid>
              <Grid item container justifyContent="flex-end" xs={12}>
                <Button type="submit" variant="contained" color="primary" startIcon={<Send />}>
                  Send
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Paper>
      <TableDialog
        open={drawer}
        title={'Select users'}
        headers={headers}
        getData={getData}
        data={{ tableData: formatData(users), count: count }}
        handleClose={() => setDrawer(false)}
        buttonText={'Select users'}
        setExternalElements={setSelectedUsers}
        externalElements={selectedUsers}
      />
    </Container>
  );
};

export default SendNotificationForm;
