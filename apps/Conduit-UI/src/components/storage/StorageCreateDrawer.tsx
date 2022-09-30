import React, { FC, useEffect } from 'react';
import { Button, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { SideDrawerWrapper } from '@conduitplatform/ui-components';
import { CreateFormSelected, IContainer, ICreateForm } from '../../models/storage/StorageModels';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';

interface Props {
  data: { open: boolean; type: CreateFormSelected };
  closeDrawer: () => void;
  containers: IContainer[];
  handleCreateFolder: (data: ICreateForm['folder']) => void;
  handleCreateContainer: (data: ICreateForm['container']) => void;
  path: string[];
}

interface FormProps {
  name: string;
  container?: string;
  isPublic: boolean;
}

const StorageCreateDrawer: FC<Props> = ({
  data,
  closeDrawer,
  containers,
  handleCreateFolder,
  handleCreateContainer,
  path,
}) => {
  const methods = useForm<FormProps>({
    defaultValues: { name: '', container: '', isPublic: false },
  });
  const { reset, setValue, register } = methods;

  useEffect(() => {
    if (data.type === CreateFormSelected.folder) {
      setValue('container', path[0]);
    }
  }, [path, data.type, setValue]);

  const handleCancel = () => {
    reset();
    closeDrawer();
  };

  const handleSave = (formData: FormProps) => {
    if (data.type === CreateFormSelected.container) {
      handleCreateContainer({ name: formData.name, isPublic: formData.isPublic });
      reset();
      closeDrawer();
      return;
    }
    if (formData.container !== undefined) {
      const pathCopy = [...path];
      pathCopy.shift();
      const folderParentName = pathCopy.join('/');
      const folderData = {
        name: folderParentName ? `${folderParentName}/${formData.name}/` : `${formData.name}/`,
        container: formData.container,
        isPublic: formData.isPublic,
      };
      handleCreateFolder(folderData);
    }
    reset();
    closeDrawer();
  };

  const extractContainers = () => {
    return containers.map((container) => {
      return { label: container.name, value: container.name };
    });
  };

  return (
    <SideDrawerWrapper
      title={`Create ${data.type}`}
      open={data.open}
      closeDrawer={() => closeDrawer()}
      width={256}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSave)}>
          <Grid container spacing={2}>
            <Grid item width={'100%'}>
              <FormInputText {...register('name')} label="Name" />
            </Grid>
            {data.type === CreateFormSelected.folder && (
              <Grid item sm={12}>
                <FormInputSelect
                  options={extractContainers()}
                  label="Container"
                  {...register('container')}
                />
              </Grid>
            )}
            <Grid item sm={12} display={'flex'} alignItems={'center'} whiteSpace={'nowrap'}>
              <Typography variant="subtitle1" mr={2}>
                Is Public
              </Typography>
              <FormInputSwitch {...register('isPublic')} />
            </Grid>
            <Grid container item mt={2}>
              <Grid item sx={{ mr: 2 }}>
                <Button onClick={() => handleCancel()} variant="outlined">
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" type="submit">
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </SideDrawerWrapper>
  );
};

export default StorageCreateDrawer;
