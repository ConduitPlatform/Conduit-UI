import { Box, Container, TextField, Button, Grid, Paper, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Clear, MailOutline, Send } from '@mui/icons-material';
import { useForm, useWatch, Controller, FormProvider } from 'react-hook-form';
import { EmailTemplateType, EmailUI } from '../models/EmailModels';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { FormInputCheckBox } from '../../../components/common/FormComponents/FormInputCheckbox';
import TemplateEditor from './TemplateEditor';
import { asyncGetEmailTemplates, asyncSendEmail } from '../store/emailsSlice';
import { Pagination, Search } from '../../../models/http/HttpModels';
import TableDialog from '../../../components/common/TableDialog';
import { SelectedElements } from '@conduitplatform/ui-components';
import { formatData, headers } from './FormatTemplatesHelper';
import { emailRegExp } from '../../../utils/validations';

interface FormProps {
  email: string;
  sender: string;
  subject: string;
  body: string;
  templateName: string;
  withTemplate: boolean;
}
const SendEmailForm: React.FC = () => {
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
  const { handleSubmit, reset, control, setValue, getValues, register } = methods;

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
        (template: EmailTemplateType) => template.name === selectedTemplate[0].Name
      );

      if (!foundTemplate?.variables) return;
      let variableValues = {};
      foundTemplate.variables.forEach((variable: string) => {
        variableValues = { ...variableValues, [variable]: '' };
      });
      setValue('subject', foundTemplate.subject);
      setValue('body', foundTemplate.body);
      if (foundTemplate.sender) {
        setValue('sender', foundTemplate.sender);
      }
      setVariables(variableValues);
    }
    if (!withTemplate) {
      if (!selectedTemplate.length) return;
      setValue('subject', '');
      setValue('body', '');
      setValue('templateName', '');
      setValue('sender', '');
      setSelectedTemplate([]);
      setVariables({});
    }
  }, [selectedTemplate, watchWithTemplate, templateDocuments]);

  return (
    <Container maxWidth="md">
      <Paper sx={{ padding: 3, color: 'text.primary', borderRadius: 7 }} elevation={0}>
        <Typography variant={'h6'} mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
          <MailOutline fontSize={'small'} sx={{ mr: 2 }} /> Compose your email
        </Typography>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormInputText
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: emailRegExp,
                      message: 'Not a valid e-mail!',
                    },
                  })}
                  label={'Recipient (To:)'}
                  typeOfInput={'text'}
                />
              </Grid>
              <Grid item xs={12}>
                <FormInputText
                  {...register('sender', {
                    required: 'Email is required',
                    pattern: {
                      value: emailRegExp,
                      message: 'Not a valid e-mail!',
                    },
                  })}
                  label={'Sender (From:)'}
                  typeOfInput={'text'}
                />
              </Grid>
              <Grid item xs={8}>
                <FormInputText
                  {...register('subject', { disabled: withTemplate })}
                  label={'Subject'}
                />
              </Grid>
              <Grid item xs={4} mt={1}>
                <FormInputCheckBox {...register('withTemplate')} label="With Template" />
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
                    sx={{ marginRight: 4 }}
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
