import { useAppDispatch, useAppSelector } from '../../redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import { Transaction } from '../../models/payments/PaymentsModels';
import useDebounce from '../../hooks/useDebounce';
import { asyncDeleteTransactions, asyncGetTransactions } from '../../redux/slices/paymentsSlice';
import { EmailUI } from '../../models/emails/EmailModels';
import { Box, InputAdornment, TextField } from '@mui/material';
import {
  ConfirmationDialog,
  DataTable,
  SideDrawerWrapper,
  TableActionsContainer,
  TableContainer,
} from '@conduitplatform/ui-components';
import SearchIcon from '@mui/icons-material/Search';
import ViewTransaction from './ViewTransaction';

const PaymentsTransactions: React.FC = () => {
  const dispatch = useAppDispatch();

  const originalTransactionState = {
    _id: '',
    userId: '',
    provider: '',
    product: '',
    quantity: 0,
    data: {},
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
  const [openDeleteTransactions, setOpenDeleteTransactions] = useState<boolean>(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction>(originalTransactionState);
  const debouncedSearch: string = useDebounce(search, 500);

  useEffect(() => {
    dispatch(
      asyncGetTransactions({
        skip,
        limit,
        search: debouncedSearch,
      })
    );
  }, [dispatch, limit, skip, debouncedSearch]);

  const { transactions, count } = useAppSelector(
    (state) => state.paymentsSlice.data.transactionData
  );

  const handleClose = () => {
    setDrawer(false);
    setSelectedTransaction(originalTransactionState);
    setOpenDeleteTransactions(false);
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

  const getCustomersCallBack = useCallback(() => {
    dispatch(asyncGetTransactions({ skip, limit, search }));
  }, [dispatch, limit, skip, search]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch]);

  const handleDeleteTitle = (transaction: Transaction) => {
    if (selectedTransaction._id === '') {
      return 'Delete selected transactions';
    }
    return `Delete transaction ${transaction._id}`;
  };

  const handleDeleteDescription = (transaction: Transaction) => {
    if (selectedTransaction._id === '') {
      return 'Are you sure you want to delete the selected treansactions?';
    }
    return `Are you sure you want to delete ${transaction._id}? `;
  };
  const deleteButtonAction = () => {
    if (openDeleteTransactions && selectedTransaction._id == '') {
      const params = {
        ids: selectedTransactions,
        getTransactions: getCustomersCallBack,
      };
      dispatch(asyncDeleteTransactions(params));
    } else {
      const params = {
        ids: [`${selectedTransaction._id}`],
        getTransactions: getCustomersCallBack,
      };
      dispatch(asyncDeleteTransactions(params));
    }
    setOpenDeleteTransactions(false);
    setSelectedTransaction(originalTransactionState);
    setSelectedTransactions([]);
  };

  const handleAction = (action: { title: string; type: string }, data: any) => {
    const currentTransaction = transactions?.find((transaction) => transaction._id === data._id);

    if (currentTransaction !== undefined) {
      if (action.type === 'view') {
        setSelectedTransaction(currentTransaction);
        setDrawer(true);
      }
    }
  };

  const handleSelect = (id: string) => {
    const newSelectedTransactions = [...selectedTransactions];

    if (selectedTransactions.includes(id)) {
      const index = newSelectedTransactions.findIndex((newId) => newId === id);
      newSelectedTransactions.splice(index, 1);
    } else {
      newSelectedTransactions.push(id);
    }
    setSelectedTransactions(newSelectedTransactions);
  };

  const handleSelectAll = (data: EmailUI[]) => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
      return;
    }
    const newSelectedTransactions = data.map((item: EmailUI) => item._id);
    setSelectedTransactions(newSelectedTransactions);
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

  const formatData = (data: Transaction[]) => {
    return data.map((u) => {
      return {
        _id: u._id,
        provider: u.provider,
        product: u.product,
        quantity: u.quantity,
        'Updated At': u.updatedAt,
      };
    });
  };

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Provider', sort: 'provider' },
    { title: 'Product', sort: 'product' },
    { title: 'Quantity', sort: 'quantity' },
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
            label="Find transaction"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      </TableActionsContainer>
      <TableContainer
        handlePageChange={handlePageChange}
        limit={limit}
        handleLimitChange={handleLimitChange}
        page={page}
        count={count}
        noData={!transactions.length ? 'transactions' : undefined}>
        <DataTable
          sort={sort}
          setSort={setSort}
          headers={headers}
          dsData={formatData(transactions)}
          handleSelect={handleSelect}
          handleSelectAll={handleSelectAll}
          actions={actions}
          handleAction={handleAction}
          selectedItems={selectedTransactions}
        />
      </TableContainer>
      <SideDrawerWrapper
        title={'Transaction overview'}
        open={drawer}
        closeDrawer={() => handleClose()}
        width={750}>
        <Box>
          <ViewTransaction transaction={selectedTransaction} />
        </Box>
      </SideDrawerWrapper>
      <ConfirmationDialog
        open={openDeleteTransactions}
        handleClose={handleClose}
        title={handleDeleteTitle(selectedTransaction)}
        description={handleDeleteDescription(selectedTransaction)}
        buttonAction={deleteButtonAction}
        buttonText={'Delete'}
      />
    </Box>
  );
};

export default PaymentsTransactions;
