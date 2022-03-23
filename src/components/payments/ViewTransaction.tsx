import React from 'react';
import { Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Image from 'next/dist/client/image';
import TransactionImage from '../../assets/svgs/transaction.svg';
import { Transaction } from '../../models/payments/PaymentsModels';
import ExtractView from './ExtractView';
import sharedClasses from '../common/sharedClasses';

interface Props {
  transaction: Transaction;
}

const ViewTransaction: React.FC<Props> = ({ transaction }) => {
  const classes = sharedClasses();

  return (
    <Container>
      <Box>
        <Paper elevation={0} className={classes.paper}>
          <Grid container spacing={2} justifyContent="space-around">
            <ExtractView valuesToShow={transaction} />
          </Grid>
        </Paper>
        <div className={classes.centeredImg}>
          <Image src={TransactionImage} width="200px" alt="transaction" />
        </div>
      </Box>
    </Container>
  );
};

export default ViewTransaction;
