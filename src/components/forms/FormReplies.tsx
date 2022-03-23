import React, { useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormsModel } from '../../models/forms/FormsModels';
import { asyncGetFormReplies } from '../../redux/slices/formsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { Chip, Container, Grid, TextField } from '@mui/material';
import Image from 'next/dist/client/image';
import formReplies from '../../assets/svgs/formReplies.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexGrow: 6,
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    justifySelf: 'center',
  },
  grid: {
    marginBottom: theme.spacing(3),
  },
  centeredImg: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textField: {
    width: '100%',
  },
  marginTop: {
    marginTop: '60px',
  },
  fields: {
    marginTop: theme.spacing(0.5),
    display: 'flex',
    marginBottom: theme.spacing(0.5),
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
  },
  badgeSpacing: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  disabledInput: {
    color: theme.palette.secondary.main,
  },
}));

interface Props {
  repliesForm: FormsModel;
}

const FormReplies: React.FC<Props> = ({ repliesForm }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (repliesForm._id !== undefined) dispatch(asyncGetFormReplies({ id: repliesForm._id }));
  });

  const { replies } = useAppSelector((state) => state.formsSlice.data);

  //Placeholder replies
  // const replies = [
  //   {
  //     _id: '1232342332352',
  //     form: {},
  //     data: { name: 'Nick', surname: 'Lamprou', age: 23 },
  //     possibleSpam: false,
  //   },
  //   {
  //     _id: '12323432233235',
  //     form: {},
  //     data: {
  //       name: 'Nick',
  //       surname: 'Charalampous',
  //       age: 46,
  //       image: 'image.jpg',
  //       file: 'drivingLicense',
  //     },
  //     possibleSpam: true,
  //   },
  //   {
  //     _id: '12323412233235',
  //     form: {},
  //     data: { name: 'Kostas', surname: 'Feggoulis', age: 26 },
  //     possibleSpam: false,
  //   },
  //   {
  //     _id: '12323423353235',
  //     form: {},
  //     data: { name: 'George', surname: 'Nikolaou', age: 42 },
  //     possibleSpam: false,
  //   },
  // ];

  return (
    <Container>
      {replies.length ? (
        replies.map((reply, index: number) => (
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
              <div className={classes.badgeSpacing}>
                <Grid container spacing={3}>
                  {Object.entries(reply.data).map(([key, value]) => {
                    return (
                      <Grid key={value} item xs={12}>
                        <TextField
                          className={classes.textField}
                          InputProps={{ classes: { disabled: classes.disabledInput } }}
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
              </div>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <>
          <Typography style={{ textAlign: 'center' }}>
            No replies available for the current form
          </Typography>
          <div className={classes.centeredImg}>
            <Image src={formReplies} alt="form replies" width="200px" />
          </div>
        </>
      )}
    </Container>
  );
};

export default FormReplies;
