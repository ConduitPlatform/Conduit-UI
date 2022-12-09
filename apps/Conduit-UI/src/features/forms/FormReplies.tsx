import React, { useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormReplies, FormsModel } from './FormsModels';
import { asyncGetFormReplies } from './formsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { Box, Chip, Container, Grid, TextField } from '@mui/material';
import Image from 'next/dist/client/image';
import formReplies from '../../assets/svgs/formReplies.svg';

interface Props {
  repliesForm: FormsModel;
}

const FormReplies: React.FC<Props> = ({ repliesForm }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (repliesForm._id !== undefined) dispatch(asyncGetFormReplies({ id: repliesForm._id }));
  }, [dispatch, repliesForm._id]);

  const { replies } = useAppSelector((state) => state.formsSlice.data);

  return (
    <Container>
      {replies.length ? (
        replies.map((reply: FormReplies, index: number) => (
          <Accordion key={reply._id}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              color="primary"
              id="panel1a-header">
              <Grid container justifyContent="space-around">
                <Grid item xs={9}>
                  <Typography>Reply {index + 1}</Typography>
                </Grid>
                <Grid item xs={3}>
                  {reply.possibleSpam && (
                    <Chip label="possible spam" color="primary" size="small" />
                  )}
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  '& > *': {
                    margin: 0.5,
                  },
                }}>
                <Grid container spacing={3}>
                  {Object.entries(reply.data).map(([key, value]) => {
                    return (
                      <Grid key={value} item xs={12}>
                        <TextField
                          sx={{ width: '100%', '& .Mui-disabled': { color: 'primary.main' } }}
                          disabled
                          color="primary"
                          id="outlined-disabled"
                          label={key}
                          defaultValue={value}
                          variant="outlined"
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <>
          <Typography sx={{ textAlign: 'center' }}>
            No replies available for the current form
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src={formReplies} alt="form replies" width="200px" />
          </Box>
        </>
      )}
    </Container>
  );
};

export default FormReplies;
