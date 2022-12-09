import React from 'react';
import { Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Image from 'next/dist/client/image';
import TransactionImage from '../../assets/svgs/transaction.svg';
import { Transaction } from './PaymentsModels';
import { ExtractDrawerInfo } from '@conduitplatform/ui-components';

interface Props {
  transaction: Transaction;
}

const ViewTransaction: React.FC<Props> = ({ transaction }) => {
  return (
    <Container>
      <Box>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            color: 'text.primary',
            mt: 2,
          }}>
          <Grid container spacing={2} justifyContent="space-around">
            <ExtractDrawerInfo valuesToShow={transaction} />
          </Grid>
        </Paper>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '-30px',
          }}>
          <Image src={TransactionImage} width="200px" alt="transaction" />
        </Box>
      </Box>
    </Container>
  );
};

export default ViewTransaction;
