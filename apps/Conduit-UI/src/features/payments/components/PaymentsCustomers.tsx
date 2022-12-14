import { useAppDispatch, useAppSelector } from '../../../redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import { Customer } from '../models/PaymentsModels';
import useDebounce from '../../../hooks/useDebounce';
import {
  asyncCreateCustomer,
  asyncDeleteCustomers,
  asyncGetCustomers,
  asyncSaveCustomerChanges,
} from '../store/paymentsSlice';
import { EmailUI } from '../../emails/models/EmailModels';
import { Box, Button, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import {
  ConfirmationDialog,
  DataTable,
  SideDrawerWrapper,
  TableActionsContainer,
  TableContainer,
} from '@conduitplatform/ui-components';
import SearchIcon from '@mui/icons-material/Search';
import { DeleteTwoTone } from '@mui/icons-material';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import ViewEditCustomer from './ViewEditCustomer';

const PaymentsCustomers: React.FC = () => {
  const dispatch = useAppDispatch();

  const originalCustomerState = {
    _id: '',
    userId: '',
    email: '',
    buyerName: '',
    phoneNumber: '',
    address: '',
    postCode: '',
    stripe: {
      customerId: '',
    },
    updatedAt: '',
    createdAt: '',
  };
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const [openDeleteCustomers, setOpenDeleteCustomers] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<boolean>(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(originalCustomerState);
  const [create, setCreate] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  const debouncedSearch: string = useDebounce(search, 500);

  useEffect(() => {
    dispatch(asyncGetCustomers({ skip, limit, search: debouncedSearch }));
  }, [dispatch, limit, skip, debouncedSearch]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch]);

  const { customers, count } = useAppSelector((state) => state.paymentsSlice.data.customerData);

  const newCustomer = () => {
    setSelectedCustomer(originalCustomerState);
    setCreate(true);
    setEdit(true);
    setDrawer(true);
  };

  const saveCustomerChanges = (data: Customer) => {
    const _id = data._id;
    const updatedData = {
      userId: data.userId,
      email: data.email,
      buyerName: data.buyerName,
      phoneNumber: data.phoneNumber,
      address: data.address,
      postCode: data.postCode,
      stripe: {
        customerId: data.stripe.customerId,
      },
    };
    if (_id !== undefined) {
      dispatch(asyncSaveCustomerChanges({ _id, data: updatedData }));
    }
    setSelectedCustomer(updatedData);
  };

  const createNewCustomer = (data: Customer) => {
    const newData = {
      _id: data._id,
      userId: data.userId,
      email: data.email,
      buyerName: data.buyerName,
      phoneNumber: data.phoneNumber,
      address: data.address,
      postCode: data.postCode,
      stripe: {
        customerId: data.stripe.customerId,
      },
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
    };
    dispatch(asyncCreateCustomer(newData));
    setSelectedCustomer(newData);
    setDrawer(false);
  };

  const getCustomersCallBack = useCallback(() => {
    dispatch(asyncGetCustomers({ skip, limit, search }));
  }, [dispatch, limit, skip, search]);

  const handleDeleteTitle = (customer: Customer) => {
    if (selectedCustomer.email === '') {
      return 'Delete selected customers';
    }
    return `Delete template ${customer.email}`;
  };

  const handleDeleteDescription = (customer: Customer) => {
    if (selectedCustomer.email === '') {
      return 'Are you sure you want to delete the selected customers?';
    }
    return `Are you sure you want to delete ${customer.email}? `;
  };
  const deleteButtonAction = () => {
    if (openDeleteCustomers && selectedCustomer.email == '') {
      const params = {
        ids: selectedCustomers,
        getCustomers: getCustomersCallBack,
      };
      dispatch(asyncDeleteCustomers(params));
    } else {
      const params = {
        ids: [`${selectedCustomer._id}`],
        getCustomers: getCustomersCallBack,
      };
      dispatch(asyncDeleteCustomers(params));
    }
    setOpenDeleteCustomers(false);
    setSelectedCustomer(originalCustomerState);
    setSelectedCustomers([]);
  };

  const handleClose = () => {
    setEdit(false);
    setCreate(false);
    setDrawer(false);
    setSelectedCustomer(originalCustomerState);
    setOpenDeleteCustomers(false);
  };

  const handleSelect = (id: string) => {
    const newSelectedCustomers = [...selectedCustomers];

    if (selectedCustomers.includes(id)) {
      const index = newSelectedCustomers.findIndex((newId) => newId === id);
      newSelectedCustomers.splice(index, 1);
    } else {
      newSelectedCustomers.push(id);
    }
    setSelectedCustomers(newSelectedCustomers);
  };

  const handleSelectAll = (data: EmailUI[]) => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
      return;
    }
    const newSelectedCustomers = data.map((item: EmailUI) => item._id);
    setSelectedCustomers(newSelectedCustomers);
  };

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, val: number) => {
    if (val > page) {
      setPage(page + 1);
      setSkip(skip + limit);
    } else {
      setPage(page - 1);
      setSkip(skip - limit);
    }
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setSkip(0);
    setPage(0);
  };

  const handleAction = (action: { title: string; type: string }, data: EmailUI) => {
    const currentCustomer = customers?.find((customer: Customer) => customer._id === data._id);

    if (currentCustomer !== undefined) {
      if (action.type === 'view') {
        setSelectedCustomer(currentCustomer);
        setEdit(false);
        setDrawer(true);
      }
      if (action.type === 'delete') {
        setSelectedCustomer(currentCustomer);
        setOpenDeleteCustomers(true);
      }
    }
  };

  const toDelete = {
    title: 'Delete',
    type: 'delete',
  };

  const toView = {
    title: 'View',
    type: 'view',
  };

  const actions = [toView, toDelete];

  const formatData = (data: Customer[]) => {
    return data.map((u) => {
      return {
        _id: u._id,
        email: u.email,
        PostCode: u.postCode,
        'Updated At': u.updatedAt,
      };
    });
  };

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Name', sort: 'buyerName' },
    { title: 'Post Code', sort: 'postCode' },
    { title: 'Updated At', sort: 'updatedAt' },
  ];

  return (
    <Box>
      <TableActionsContainer>
        {count >= 0 && (
          <TextField
            size="small"
            variant="outlined"
            name="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label="Find customer"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        <Box display="flex" alignItems="center" gap={3}>
          {selectedCustomers.length > 0 && (
            <IconButton
              sx={{ marginRight: '10px' }}
              size="small"
              aria-label="delete"
              color="primary"
              onClick={() => setOpenDeleteCustomers(true)}>
              <Tooltip title="Delete multiple customers">
                <DeleteTwoTone />
              </Tooltip>
            </IconButton>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => newCustomer()}>
            Add Customer
          </Button>
        </Box>
      </TableActionsContainer>
      <TableContainer
        handlePageChange={handlePageChange}
        limit={limit}
        handleLimitChange={handleLimitChange}
        page={page}
        count={count}
        noData={!customers.length ? 'customers' : undefined}>
        <DataTable
          sort={sort}
          setSort={setSort}
          headers={headers}
          dsData={formatData(customers)}
          actions={actions}
          handleAction={handleAction}
          handleSelect={handleSelect}
          handleSelectAll={handleSelectAll}
          selectedItems={selectedCustomers}
        />
      </TableContainer>
      <SideDrawerWrapper
        title={!create ? 'Customer overview' : 'Create a new customer'}
        open={drawer}
        closeDrawer={() => handleClose()}
        width={750}>
        <ViewEditCustomer
          handleCreate={createNewCustomer}
          handleSave={saveCustomerChanges}
          customer={selectedCustomer}
          edit={edit}
          setEdit={setEdit}
          create={create}
          setCreate={setCreate}
          handleClose={() => handleClose()}
        />
      </SideDrawerWrapper>
      <ConfirmationDialog
        open={openDeleteCustomers}
        handleClose={handleClose}
        title={handleDeleteTitle(selectedCustomer)}
        description={handleDeleteDescription(selectedCustomer)}
        buttonAction={deleteButtonAction}
        buttonText={'Delete'}
      />
    </Box>
  );
};

export default PaymentsCustomers;
