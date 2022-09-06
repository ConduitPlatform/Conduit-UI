import React, { FC, useCallback, useState } from 'react';
import { Button, Grid, TextField } from '@mui/material';
import { SideDrawerWrapper } from '@conduitplatform/ui-components';
import TableDialog from '../common/TableDialog';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncGetAuthUserData } from '../../redux/slices/authenticationSlice';
import { AuthUser, AuthUserUI } from '../../models/authentication/AuthModels';
import { SelectedElements } from '@conduitplatform/ui-components';
import { Pagination, Search } from '../../models/http/HttpModels';

interface ICreateChatRoom {
  name: string;
  participants: AuthUserUI[];
}

interface Props {
  open: boolean;
  handleCreateChatRoom: (data: ICreateChatRoom) => void;
  closeDrawer: () => void;
}

const CreateChatRoomDrawer: FC<Props> = ({ open, handleCreateChatRoom, closeDrawer }) => {
  const dispatch = useAppDispatch();

  const initialInputData = {
    name: '',
    participants: [],
  };
  const [inputData, setInputData] = useState<ICreateChatRoom>(initialInputData);

  const handleCancel = () => {
    setInputData(initialInputData);
    closeDrawer();
  };

  const handleSave = () => {
    handleCreateChatRoom(inputData);
    setInputData(initialInputData);
    closeDrawer();
  };

  const [usersDialog, setUsersDialog] = useState<boolean>(false);

  const { users, count } = useAppSelector((state) => state.authenticationSlice.data.authUsers);

  const getData = useCallback(
    (params: Pagination & Search & { provider: string }) => {
      dispatch(asyncGetAuthUserData(params));
    },
    [dispatch]
  );

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

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Email', sort: 'email' },
    { title: 'Active', sort: 'active' },
    { title: 'Verified', sort: 'isVerified' },
    { title: 'Registered At', sort: 'createdAt' },
  ];

  const removeSelectedUser = (i: number) => {
    const filteredArray = inputData.participants.filter((user, index) => index !== i);
    setInputData({ ...inputData, participants: filteredArray });
  };

  return (
    <>
      <SideDrawerWrapper
        title=" Create chat room"
        open={open}
        closeDrawer={() => closeDrawer()}
        width={256}>
        <Grid container spacing={2}>
          <Grid item>
            <TextField
              variant="outlined"
              label="Name"
              value={inputData.name}
              onChange={(event) => {
                setInputData({
                  ...inputData,
                  name: event.target.value,
                });
              }}
            />
          </Grid>
          <Grid item sm={12}>
            <SelectedElements
              selectedElements={inputData.participants.map((participant) => participant.Email)}
              handleButtonAction={() => setUsersDialog(true)}
              removeSelectedElement={removeSelectedUser}
              buttonText={'Add participants'}
              header={'Selected participants'}
              style={{ margin: 2 }}
            />
          </Grid>
          <Grid container item>
            <Grid item sx={{ mr: 2 }}>
              <Button onClick={() => handleCancel()} variant="outlined">
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={inputData?.participants?.length === 0 || inputData?.name?.length === 0}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </SideDrawerWrapper>
      <TableDialog
        open={usersDialog}
        title={'Select users'}
        headers={headers}
        getData={getData}
        data={{ tableData: formatData(users), count: count }}
        handleClose={() => setUsersDialog(false)}
        buttonText={'Select participants'}
        setExternalElements={(values) => {
          setInputData({
            ...inputData,
            participants: values,
          });
        }}
        externalElements={inputData.participants}
      />
    </>
  );
};

export default CreateChatRoomDrawer;
