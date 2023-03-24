import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { AuthTeam } from '../models/AuthModels';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputSelect } from '../../../components/common/FormComponents/FormInputSelect';
import Typography from '@mui/material/Typography';

interface Props {
  team?: AuthTeam;
  members: string[];
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: { role: 'owner' | 'member' }) => void;
}

const EditTeamMembersDialog: React.FC<Props> = ({ team, members, open, handleClose, onSubmit }) => {
  const methods = useForm<{ role: 'owner' | 'member' }>({
    defaultValues: { role: 'member' },
  });

  const { handleSubmit, reset, register } = methods;

  const onClose = () => {
    reset();
    handleClose();
  };

  const onHandleSubmit = (data: { role: 'owner' | 'member' }) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="simple-dialog-title">
        {`Edit ${team?.name} team members`}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', left: '92%', top: '1%', color: 'gray' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onHandleSubmit)}>
            <Container
              sx={{
                flexGrow: 6,
                alignItems: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
                justifySelf: 'center',
              }}
              maxWidth="sm">
              <Grid
                container
                alignItems="center"
                sx={{
                  flexGrow: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  justifyItems: 'center',
                  justifySelf: 'center',
                }}
                spacing={2}>
                <Grid item sm={12}>
                  <Typography display={'block'} variant={'body1'}>
                    {`Edit ${members.length} team members in the team ${team?.name}`}
                  </Typography>
                </Grid>
                <Grid item sm={12}>
                  <FormInputSelect
                    {...register('role')}
                    label="Role"
                    options={[
                      {
                        label: 'Owner',
                        value: 'owner',
                      },
                      {
                        label: 'Member',
                        value: 'member',
                      },
                    ]}
                  />
                </Grid>
                <Grid item sm={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<DoneOutlineIcon />}>
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamMembersDialog;
