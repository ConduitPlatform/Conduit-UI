import React, { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import { Button, Grid, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { SideDrawerWrapper, Dropzone } from '@conduitplatform/ui-components';
import { IContainer, IStorageFile } from '../../models/storage/StorageModels';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { validFileName } from '../../utils/validations';
import { useAppDispatch } from '../../redux/store';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import StorageIcon from '@mui/icons-material/Storage';
import FolderIcon from '@mui/icons-material/Folder';

interface Props {
  open: boolean;
  closeDrawer: () => void;
  containers: IContainer[];
  handleAddFile: (data: IStorageFile) => void;
  path: string[];
}

interface FormData {
  name: string;
  folder: string;
  container: string;
  isPublic: boolean;
}

const StorageAddDrawer: FC<Props> = ({
  open,
  closeDrawer,
  // containers,
  handleAddFile,
  path,
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<{ data: string; mimeType: string }>({
    data: '',
    mimeType: '',
  });

  const methods = useForm<FormData>({
    defaultValues: useMemo(() => {
      return { name: '', folder: '', container: '', isPublic: false };
    }, []),
  });
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
    setValue('container', path[0]);
    const pathCopy = [...path];
    pathCopy.shift();
    const folderParentName = pathCopy.join('/');
    setValue('folder', folderParentName);
  }, [path, setValue, open]);

  const setInitialFileData = () => {
    reset();
    setFileData({ data: '', mimeType: '' });
  };

  const handleCancel = () => {
    closeDrawer();
    setInitialFileData();
  };

  const handleAdd = (data: FormData) => {
    if (fileData.data === '' && fileData.mimeType === '') {
      dispatch(enqueueInfoNotification('Please upload a file to procceed!'));
      return;
    }
    closeDrawer();
    const sendFileData = {
      ...data,
      folder: data.folder,
      data: fileData.data,
      mimeType: fileData.mimeType,
    };

    setInitialFileData();

    handleAddFile(sendFileData);
  };

  const transformFileName = (fileName: string) => {
    let finalValue = fileName;
    if (finalValue?.includes(' ')) {
      finalValue = finalValue?.replaceAll(' ', '_');
    }
    return finalValue;
  };

  const handleSetFile = (data: string, mimeType: string, name: string) => {
    setFileData({
      data: data,
      mimeType: mimeType,
    });
    setValue('name', transformFileName(name));
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
    () => fileData.data === '' || fileData.mimeType === '' || nameWatch?.length === 0 || !!error,
    [error, fileData, nameWatch?.length]
  );

  const handleSetAutoFileName = (str: string) => {
    const newFileName = transformFileName(str);
    setFileName(newFileName);
  };

  return (
    <SideDrawerWrapper title={'Add File'} open={open} closeDrawer={() => closeDrawer()} width={512}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleAdd)}>
          <Grid container spacing={2}>
            <Grid item>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <StorageIcon sx={{ color: theme.palette.primary.dark, mr: 1 }} />
                {containerName}
              </Typography>
            </Grid>
            {folderName ? (
              <Grid item>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <FolderIcon sx={{ color: theme.palette.primary.dark, mr: 1 }} />
                  {folderName}
                </Typography>
              </Grid>
            ) : null}
            <Grid item xs={12}>
              <Dropzone
                mimeType={fileData.mimeType}
                fileName={fileName}
                setFileName={handleSetAutoFileName}
                file={fileData.data}
                setFile={handleSetFile}
              />
            </Grid>
            <Grid item xs={12}>
              <FormInputText
                {...register('name', {
                  onChange: handleChangeInput,
                  pattern: {
                    value: validFileName,
                    message: 'No spaces or special characters allowed!',
                  },
                  validate: (value) => value !== '',
                })}
                label="File name"
              />
            </Grid>
            <Grid item sm={12} display={'flex'} alignItems={'center'}>
              <Typography variant="subtitle1" sx={{ mr: 1 }}>
                Public
              </Typography>
              <FormInputSwitch {...register('isPublic')} />
            </Grid>
            <Grid container item>
              <Grid item sx={{ mr: 2 }}>
                <Button variant="outlined" onClick={() => handleCancel()}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={handleDisableAdd}>
                  Add
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </SideDrawerWrapper>
  );
};

export default StorageAddDrawer;
