import React, { FC, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { v4 as uuidV4 } from 'uuid';
import { useAppDispatch } from '../../redux/store';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormsModel } from '../../models/forms/FormsModels';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';

interface PropsForInputFields {
  id: string;
  key: string;
  type: string;
}

interface Props {
  preloadedValues: FormsModel;
  handleSubmitData: (data: FormsModel) => void;
}

interface IForm {
  name: string;
  forwardTo: string;
  emailField: string;
  enabled: boolean;
}

const CustomizedGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  display: 'flex',
  marginBottom: theme.spacing(0.5),
  alignItems: 'center',
  width: '80%',
  justifyContent: 'center',
}));

const EditableForm: FC<Props> = ({ preloadedValues, handleSubmitData }) => {
  const dispatch = useAppDispatch();
  const [inputFields, setInputFields] = useState<{ id: string; key: string; type: string }[]>([
    { id: uuidV4(), key: '', type: '' },
  ]);

  const methods = useForm<IForm>({ defaultValues: preloadedValues });

  const { reset, getValues, setValue, register } = methods;

  const handleAddField = () => {
    setInputFields([...inputFields, { id: uuidV4(), key: '', type: '' }]);
  };

  useEffect(() => {
    const fieldsToDisplay: PropsForInputFields[] = [];
    Object.entries(preloadedValues.fields).forEach(([key, value]) => {
      fieldsToDisplay.push({ id: uuidV4(), key: key, type: value as string });
    });
    setInputFields(fieldsToDisplay);
  }, [preloadedValues]);

  const onCancel = () => {
    const fieldsToDisplay: PropsForInputFields[] = [];
    Object.entries(preloadedValues.fields).forEach(([key, value]) => {
      fieldsToDisplay.push({ id: uuidV4(), key: key, type: value as string });
    });
    setInputFields(fieldsToDisplay);
    reset();
  };

  const onSubmit = (data: IForm) => {
    const fields: { [key: string]: string } = {};
    inputFields.forEach((item) => {
      if (item.key !== '' && item.type !== '') fields[item.key] = item.type;
    });

    handleSubmitData({ ...data, fields: fields });
  };

  const handleFieldsChange = (id: string) => (evt: any) => {
    const { value } = evt.target;

    const regex = /[^a-z0-9_]/gi;
    if (regex.test(value)) {
      dispatch(
        enqueueInfoNotification(
          'The form name can only contain alpharithmetics and _',
          'infoDuplicate'
        )
      );
    }
    setInputFields((list) =>
      list.map((el) =>
        el.id === id
          ? {
              ...el,
              [evt.target.name]: value.replace(/[^a-z0-9_]/gi, ''),
            }
          : el
      )
    );
  };

  const handleRemoveField = (id: string) => {
    setInputFields((list) => list.filter((el) => el.id !== id));
  };

  const validOptions = () => {
    const arr: { value: string; label: string }[] = [{ value: '', label: 'No item selected' }];
    inputFields.forEach((field) => {
      if (field.type === 'String' && field.key !== '') {
        arr.push({ value: field.key, label: field.key });
      }
    });

    const emailFieldValue = getValues('emailField');

    if (!arr.find((item) => item.value === emailFieldValue)) {
      setValue('emailField', '');
    }
    return arr;
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item sm={12}>
            <FormInputText
              {...register('name', {
                required: 'The form name is required',
                pattern: { value: /^[A-Za-z]+$/, message: 'A form name should not have spaces' },
              })}
              label="Name"
            />
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs={11}>
              <Typography variant="subtitle2">Form fields:</Typography>
            </Grid>
            <Grid item xs={1}>
              <IconButton color="primary" size="small" aria-label="add" onClick={handleAddField}>
                <Add />
              </IconButton>
            </Grid>
          </Grid>
          <Grid item sm={12}>
            {inputFields.map((inputField, index: number) => {
              return (
                <Grid key={index} container spacing={2} sx={{ mt: 0.2 }}>
                  <CustomizedGrid item xs={5}>
                    <TextField
                      name="key"
                      label="Key"
                      variant="outlined"
                      value={inputField.key}
                      onChange={handleFieldsChange(inputField.id)}
                    />
                  </CustomizedGrid>
                  <CustomizedGrid item xs={5}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <Select
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                        value={inputField.type}
                        onChange={handleFieldsChange(inputField.id)}
                        name="type">
                        <MenuItem value={'String'}>String</MenuItem>
                        <MenuItem value={'File'}>File</MenuItem>
                        <MenuItem value={'Date'}>Date</MenuItem>
                        <MenuItem value={'Number'}>Number</MenuItem>
                      </Select>
                    </FormControl>
                  </CustomizedGrid>
                  <CustomizedGrid item xs={2}>
                    <IconButton
                      color="primary"
                      size="small"
                      aria-label="delete"
                      onClick={() => handleRemoveField(inputField.id)}>
                      <Delete />
                    </IconButton>
                  </CustomizedGrid>
                </Grid>
              );
            })}
          </Grid>
          <Grid item sm={12}>
            <FormInputText
              {...register('forwardTo', { required: 'Forward to is required' })}
              label="Forward to"
            />
          </Grid>
          <Grid item sm={12}>
            <FormInputSelect
              {...register('emailField', { required: 'Email field is required' })}
              label="Email Field"
              options={validOptions()}
            />
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs={11}>
              <Typography variant="subtitle2">Enabled form:</Typography>
            </Grid>
            <Grid item xs={1}>
              <FormInputSwitch {...register('enabled')} />
            </Grid>
          </Grid>
          <Grid container item>
            <Grid item sx={{ mr: 2 }}>
              <Button variant="outlined" onClick={() => onCancel()}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" type="submit">
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default EditableForm;
