import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import React from 'react';
import { EmailTemplateType } from '../models/EmailModels';
import { ExtractDrawerInfo } from '@conduitplatform/ui-components';
import { Button, Paper } from '@mui/material';
import TemplateForm from './TemplateForm';

interface Props {
  handleCreate: (templateState: EmailTemplateType) => void;
  handleSave: (templateState: EmailTemplateType) => void;
  template: EmailTemplateType;
  edit: boolean;
  setEdit: (value: boolean) => void;
  create: boolean;
  setCreate: (value: boolean) => void;
}

const EmailDrawerContent: React.FC<Props> = ({
  handleCreate,
  handleSave,
  template,
  edit,
  setEdit,
  create,
  setCreate,
}) => {
  const handleSaveClick = (data: EmailTemplateType) => {
    if (create) {
      handleCreate(data);
    } else {
      handleSave(data);
    }
    setCreate(false);
    setEdit(!edit);
  };

  return (
    <Container>
      <Box>
        <Paper
          elevation={0}
          sx={{
            padding: 2,
            color: 'text.primary',
            mt: 2,
          }}>
          <Grid container spacing={2} justifyContent="space-around">
            {edit ? (
              <TemplateForm preloadedValues={template} handleSubmitData={handleSaveClick} />
            ) : (
              <>
                <ExtractDrawerInfo valuesToShow={template} />
              </>
            )}
          </Grid>
        </Paper>
        {!edit && (
          <Grid container alignItems={'center'} direction={'column'}>
            <Grid item>
              <Button size={'large'} variant={'outlined'} onClick={() => setEdit(!edit)}>
                Edit
              </Button>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default EmailDrawerContent;
