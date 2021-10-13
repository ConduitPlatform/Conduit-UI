import { Paper } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import { EmailTemplateType } from '../../models/emails/EmailModels';

const useStyles = makeStyles((theme) => ({
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    minWidth: '300px',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  grid: {
    marginBottom: theme.spacing(3),
  },
  multiline: {
    width: '100%',
    marginBottom: theme.spacing(3),
  },
  textField: {
    width: '100%',
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
    border: `0.5px solid ${theme.palette.secondary.main}`,
  },
  chip: {
    margin: theme.spacing(1),
    color: theme.palette.secondary.main,
  },
}));

interface Props {
  edit: boolean;
  add: boolean;
  templateState: EmailTemplateType;
  setAdd: (value: boolean) => void;
  setTemplateState: (values: EmailTemplateType) => void;
}

const EmailDetails: React.FC<Props> = ({ edit, add, templateState, setAdd, setTemplateState }) => {
  const classes = useStyles();

  return (
    <Box>
      <Paper elevation={12} className={classes.paper}>
        <Grid container className={classes.grid}>
          <Grid item xs={12}>
            {edit ? (
              <TextField
                label={'Subject'}
                variant="outlined"
                className={classes.textField}
                value={templateState.subject}
                onChange={(event) => {
                  setTemplateState({ ...templateState, subject: event.target.value });
                }}
              />
            ) : (
              <>
                <Typography variant="body1">Subject</Typography>
                <Typography variant="subtitle2">{templateState.subject}</Typography>
              </>
            )}
          </Grid>
        </Grid>
        {edit ? (
          <TextField
            className={classes.multiline}
            id="filled-textarea"
            label="Body"
            multiline
            rows={8}
            variant="outlined"
            value={templateState.body}
            onChange={(event) => {
              setTemplateState({
                ...templateState,
                body: event.target.value,
              });
            }}
            InputProps={{
              readOnly: !edit,
            }}
          />
        ) : (
          <>
            <Typography variant="body1">Body</Typography>
            <Typography variant="subtitle2" style={{ whiteSpace: 'pre-line' }}>
              {templateState.body}
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default EmailDetails;
