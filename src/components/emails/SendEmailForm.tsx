import {
  Box,
  Container,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  makeStyles,
} from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Clear, MailOutline, Send } from '@material-ui/icons';
import { useForm, useWatch, Controller, FormProvider } from 'react-hook-form';
import { EmailTemplateType, EmailUI } from '../../models/emails/EmailModels';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputCheckBox } from '../common/FormComponents/FormInputCheckbox';
import TemplateEditor from './TemplateEditor';
import { asyncGetEmailTemplates, asyncSendEmail } from '../../redux/slices/emailsSlice';
import { Pagination, Search } from '../../models/http/HttpModels';
import TableDialog from '../common/TableDialog';
import SelectedElements from '../common/SelectedElements';
import { formatData, headers } from '../../components/emails/FormatTemplatesHelper';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  simpleTextField: {
    width: '65ch',
  },
  typography: {
    marginBottom: theme.spacing(4),
  },
  checkBox: {
    marginTop: '5px',
  },
}));

interface FormProps {
  email: string;
  sender: string;
  subject: string;
  body: string;
  templateName: string;
  withTemplate: boolean;
}
const SendEmailForm: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const [variables, setVariables] = useState<{ [key: string]: string }>({});
  const { templateDocuments, totalCount } = useAppSelector((state) => state.emailsSlice.data);
  const [drawer, setDrawer] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailUI[]>([]);

  const methods = useForm<FormProps>({
    defaultValues: {
      email: '',
      sender: '',
      subject: '',
      templateName: '',
      body: '',
      withTemplate: false,
    },
  });
  const { handleSubmit, reset, control, setValue, getValues } = methods;

  const getData = useCallback(
    (params: Pagination & Search & { provider: string }) => {
      dispatch(asyncGetEmailTemplates(params));
    },
    [dispatch]
  );

  const removeSelectedTemplate = (i: number) => {
    const filteredArray = selectedTemplate.filter((template, index) => index !== i);
    setSelectedTemplate(filteredArray);
    setVariables({});
    setValue('body', '');
    setValue('subject', '');
  };

  const handleCancel = () => {
    setVariables({});
    setSelectedTemplate([]);
    reset();
  };

  const watchWithTemplate = useWatch({
    control,
    name: 'withTemplate',
  });

  const withTemplate = getValues('withTemplate');

  const onSubmit = (data: FormProps) => {
    let email;
    if (selectedTemplate.length) {
      email = {
        subject: data.subject,
        sender: data.sender,
        email: data.email,
        body: data.body,
        templateName: selectedTemplate[0].Name,
        variables: variables,
      };
    } else {
      email = {
        subject: data.subject,
        sender: data.sender,
        email: data.email,
        body: data.body,
      };
    }

    dispatch(asyncSendEmail(email));
  };

  useEffect(() => {
    if (withTemplate) {
      if (!selectedTemplate.length) return;
      const foundTemplate = templateDocuments.find(
        (template) => template.name === selectedTemplate[0].Name
      );

      if (!foundTemplate) return;
      let variableValues = {};
      foundTemplate.variables.forEach((variable: string) => {
        variableValues = { ...variableValues, [variable]: '' };
      });
      setValue('subject', foundTemplate.subject);
      setValue('body', foundTemplate.body);
      setVariables(variableValues);
    }
    if (!withTemplate) {
      if (!selectedTemplate.length) return;
      setValue('subject', '');
      setValue('body', '');
      setValue('templateName', '');
      setSelectedTemplate([]);
      setVariables({});
    }
  }, [selectedTemplate, watchWithTemplate, templateDocuments]);

  return (
    <Container maxWidth="md">
      <Paper className={classes.paper} elevation={1}>
        <Typography variant={'h6'} className={classes.typography}>
          <MailOutline fontSize={'small'} /> Compose your email
        </Typography>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormInputText name="email" label={'Recipient (To:)'} />
              </Grid>
              <Grid item xs={12}>
                <FormInputText name="sender" label={'Sender (From:)'} />
              </Grid>
              <Grid item xs={8}>
                <FormInputText name="subject" label={'Subject'} disabled={withTemplate} />
              </Grid>
              <Grid item xs={4} className={classes.checkBox}>
                <FormInputCheckBox name="withTemplate" label="With Template" />
              </Grid>
              <Grid item xs={12}>
                <SelectedElements
                  disabled={!withTemplate}
                  selectedElements={selectedTemplate.map((template) => template.Name)}
                  handleButtonAction={() => setDrawer(true)}
                  removeSelectedElement={removeSelectedTemplate}
                  buttonText={'Add template'}
                  header={'Selected template'}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="body"
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value } }) => (
                    <TemplateEditor
                      disabled={withTemplate ? true : false}
                      value={value}
                      setValue={onChange}
                    />
                  )}
                  rules={{ required: 'Template body required' }}
                />
              </Grid>
              <Grid container item xs={12} spacing={1}>
                {Object.entries(variables).map(([key, value], index: number) => (
                  <Grid key={key + '_' + index} item xs={3}>
                    <TextField
                      label={key}
                      variant="outlined"
                      required
                      fullWidth
                      value={value}
                      onChange={(event) => {
                        setVariables({ ...variables, [key]: event.target.value });
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Grid item container justifyContent="flex-end" xs={12}>
                <Box marginTop={3}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Clear />}
                    style={{ marginRight: 16 }}
                    onClick={() => handleCancel()}>
                    Clear
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<Send />} type="submit">
                    Send
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <TableDialog
              open={drawer}
              singleSelect
              title={'Select templates'}
              headers={headers}
              getData={getData}
              data={{ tableData: formatData(templateDocuments), count: totalCount }}
              handleClose={() => setDrawer(false)}
              buttonText={'Select template'}
              setExternalElements={setSelectedTemplate}
              externalElements={selectedTemplate}
            />
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default SendEmailForm;
