import { useAppDispatch, useAppSelector } from '../../redux/store';
import React, { useEffect, useState } from 'react';
import { Subscription } from '../../models/payments/PaymentsModels';
import useDebounce from '../../hooks/useDebounce';
import { asyncGetSubscriptions } from '../../redux/slices/paymentsSlice';
import {
  DataTable,
  SideDrawerWrapper,
  TableActionsContainer,
  TableContainer,
} from '@conduitplatform/ui-components';
import { Box, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewSubscription from './ViewSubscription';

const PaymentsSubscriptions: React.FC = () => {
  const dispatch = useAppDispatch();

  const originalSubscriptionState = {
    _id: '',
    product: '',
    userId: '',
    customerId: '',
    iamport: {
      nextPaymentId: '',
    },
    activeUntil: '',
    transactions: [],
    provider: '',
    createdAt: '',
    updatedAt: '',
  };

  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription>(originalSubscriptionState);

  const debouncedSearch: string = useDebounce(search, 500);

  useEffect(() => {
    dispatch(asyncGetSubscriptions({ skip, limit, search: debouncedSearch }));
  }, [dispatch, limit, skip, debouncedSearch]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch]);

  const { subscriptions, count } = useAppSelector(
    (state) => state.paymentsSlice.data.subscriptionData
  );

  const handleClose = () => {
    setDrawer(false);
    setSelectedSubscription(originalSubscriptionState);
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

  const formatData = (data: Subscription[]) => {
    return data.map((u) => {
      return {
        _id: u._id,
        product: u.product,
        activeUntil: u.activeUntil,
        'Updated At': u.updatedAt,
      };
    });
  };

  const handleAction = (action: { title: string; type: string }, data: Subscription) => {
    const currentTransaction = subscriptions?.find(
      (subscription: Subscription) => subscription._id === data._id
    );

    if (currentTransaction !== undefined) {
      if (action.type === 'view') {
        setSelectedSubscription(currentTransaction);
        setDrawer(true);
      }
    }
  };

  const handleSelect = (id: string) => {
    const newSelectedSubscriptions = [...selectedSubscriptions];

    if (selectedSubscriptions.includes(id)) {
      const index = newSelectedSubscriptions.findIndex((newId) => newId === id);
      newSelectedSubscriptions.splice(index, 1);
    } else {
      newSelectedSubscriptions.push(id);
    }
    setSelectedSubscriptions(newSelectedSubscriptions);
  };

  const handleSelectAll = (data: any[]) => {
    if (setSelectedSubscriptions.length === subscriptions.length) {
      setSelectedSubscriptions([]);
      return;
    }
    const newSelectedTransactions = data.map((item: any) => item._id);
    setSelectedSubscriptions(newSelectedTransactions);
  };

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Product', sort: 'product' },
    { title: 'Active until', sort: 'actuveUntil' },
    { title: 'Updated At', sort: 'updatedAt' },
  ];

  const toView = {
    title: 'View',
    type: 'view',
  };

  const actions = [toView];

  return (
    <div>
      <TableActionsContainer>
        {subscriptions && (
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
        noData={!subscriptions.length ? 'subscriptions' : undefined}>
        <DataTable
          dsData={formatData(subscriptions)}
          sort={sort}
          setSort={setSort}
          headers={headers}
          handleSelect={handleSelect}
          handleSelectAll={handleSelectAll}
          actions={actions}
          handleAction={handleAction}
          selectedItems={selectedSubscriptions}
        />
      </TableContainer>
      <SideDrawerWrapper
        title={'Subscription overview'}
        open={drawer}
        closeDrawer={() => handleClose()}
        width={1400}>
        <Box>
          <ViewSubscription subscription={selectedSubscription} />
        </Box>
      </SideDrawerWrapper>
    </div>
  );
};

export default PaymentsSubscriptions;
