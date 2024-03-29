import React, { ChangeEvent, FC, useEffect, useMemo } from 'react';
import { Button, Grid, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { SideDrawerWrapper } from '@conduitplatform/ui-components';
import { CreateFormSelected, IContainer, ICreateForm } from '../models/StorageModels';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { validFileName } from '../../../utils/validations';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';

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
  folder: string;
}

const StorageCreateDrawer: FC<Props> = ({
  data,
  closeDrawer,
  // containers,
  handleCreateFolder,
  handleCreateContainer,
  path,
}) => {
  const methods = useForm<FormProps>({
    defaultValues: { name: '', folder: '', container: '', isPublic: false },
  });
  const theme = useTheme();

  const { control, reset, setValue, clearErrors, setError, register, getFieldState, formState } =
    methods;

  const { error } = getFieldState('name', formState); // It is subscribed now and reactive to error state updated

  const nameWatch = useWatch({
    control,
    name: 'name',
    defaultValue: '',
  });

  const containerName = useWatch({
    control,
    name: 'container',
    defaultValue: '',
  });

  const folderName = useWatch({
    control,
    name: 'folder',
    defaultValue: '',
  });

  useEffect(() => {
    if (data.type === CreateFormSelected.folder) {
      setValue('container', path[0]);
      const pathCopy = [...path];
      pathCopy.shift();
      const folderParentName = pathCopy.join('/');
      setValue('folder', folderParentName);
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

  const transformFileName = (fileName: string) => {
    let finalValue = fileName;
    if (finalValue?.includes(' ')) {
      finalValue = finalValue?.replaceAll(' ', '_');
    }
    return finalValue;
  };

  const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    const finalValue = transformFileName(event?.target?.value);

    if (finalValue?.length > 0 && !finalValue?.match(validFileName)) {
      setError('name', { type: 'custom', message: 'No special characters allowed!' });
    } else {
      clearErrors('name');
    }
    setValue('name', finalValue);
  };

  const handleDisableAdd = useMemo(
    () => nameWatch?.length === 0 || !!error,
    [error, nameWatch?.length]
  );

  return (
    <SideDrawerWrapper
      title={`Create ${data.type}`}
      open={data.open}
      closeDrawer={() => closeDrawer()}
      width={256}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSave)}>
          <Grid container spacing={2}>
            {data.type === CreateFormSelected.folder && (
              <Grid item>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <StorageIcon sx={{ color: theme.palette.primary.dark, mr: 1 }} />
                  {containerName}
                </Typography>
              </Grid>
            )}
            {folderName ? (
              <Grid item>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <FolderIcon sx={{ color: theme.palette.primary.dark, mr: 1 }} />
                  {folderName}
                </Typography>
              </Grid>
            ) : null}

            <Grid item width={'100%'}>
              <FormInputText
                {...register('name', {
                  onChange: handleChangeInput,
                  pattern: {
                    value: validFileName,
                    message: 'No spaces or special characters allowed!',
                  },
                  validate: (value) => value !== '',
                })}
                label="Name"
              />
            </Grid>
            <Grid item sm={12} display={'flex'} alignItems={'center'} whiteSpace={'nowrap'}>
              <Typography variant="subtitle1" mr={2}>
                Public
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
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={handleDisableAdd}>
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
