import React, { FC, useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button, Grid } from '@mui/material';
import { Customer } from '../../../models/payments/PaymentsModels';
import { FormInputText } from '../../common/FormComponents/FormInputText';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { AuthUser, AuthUserUI } from '../../../models/authentication/AuthModels';
import { asyncGetAuthUserData } from '../../../redux/slices/authenticationSlice';
import TableDialog from '../../common/TableDialog';
import { SelectedElements } from '@conduitplatform/ui-components';
import { camelCase, startCase } from 'lodash';
import { Pagination, Search } from '../../../models/http/HttpModels';

interface Props {
  preloadedValues: Customer;
  handleSubmitData: (data: Customer) => void;
}

const CustomerForm: FC<Props> = ({ preloadedValues, handleSubmitData }) => {
  const dispatch = useAppDispatch();

  const methods = useForm<Customer>({ defaultValues: preloadedValues });
  const { reset } = methods;

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

  const onSubmit = (data: Customer) => {
    handleSubmitData({ ...data, userId: selectedUsers[0]._id });
    reset();
  };

  const onCancel = () => {
    setSelectedUsers([]);
    reset();
  };

  const removeSelectedUser = (i: number) => {
    const filteredArray = selectedUsers.filter((user, index) => index !== i);
    setSelectedUsers(filteredArray);
  };

  const inputs = ['email', 'buyerName', 'phoneNumber', 'address', 'postCode'];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item sm={12}>
            <SelectedElements
              selectedElements={selectedUsers.map((user) => user.Email)}
              handleButtonAction={() => setDrawer(true)}
              removeSelectedElement={removeSelectedUser}
              buttonText={'Add user'}
              header={'Selected user'}
            />
          </Grid>
          {inputs.map((input, index) => (
            <Grid key={index} item sm={12}>
              <FormInputText
                name={input}
                rules={{ required: `${input} is required` }}
                label={startCase(camelCase(input))}
              />
            </Grid>
          ))}
          <Grid container item>
            <Grid item sx={{ mr: 2 }}>
              <Button variant="outlined" onClick={() => onCancel()}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" type="submit">
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <TableDialog
          open={drawer}
          singleSelect
          title={'Select users'}
          headers={headers}
          getData={getData}
          data={{ tableData: formatData(users), count: count }}
          handleClose={() => setDrawer(false)}
          buttonText={'Select user'}
          setExternalElements={setSelectedUsers}
          externalElements={selectedUsers}
        />
      </form>
    </FormProvider>
  );
};

export default CustomerForm;
