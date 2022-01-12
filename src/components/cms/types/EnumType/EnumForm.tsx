import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { FC, useMemo } from 'react';
import { IDrawerData, IEnumData } from '../../../../models/cms/BuildTypesModels';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../../../common/FormComponents/FormInputText';
import { FormInputSelect } from '../../../common/FormComponents/FormInputSelect';
import { FormInputSwitch } from '../../../common/FormComponents/FormInputSwitch';

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'grid',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  info: {
    opacity: '0.5',
  },
}));

interface IProps {
  drawerData: IDrawerData;
  readOnly: boolean;
  onSubmit: (data: any) => void;
  onClose: () => void;
  selectedItem: IEnumData;
}
const selectItems = [
  { label: 'None', value: '' },
  { label: 'Text', value: 'Text' },
  { label: 'Number', value: 'Number' },
];

const EnumForm: FC<IProps> = ({
  drawerData,
  readOnly,
  onSubmit,
  onClose,
  selectedItem,
  ...rest
}) => {
  const classes = useStyles();
  const methods = useForm({
    defaultValues: useMemo(
      () => ({
        name: selectedItem ? selectedItem.name : '',
        type: selectedItem ? selectedItem.type : drawerData.type,
        select: selectedItem ? selectedItem.select : true,
        required: selectedItem ? selectedItem.required : false,
        enumValues: selectedItem ? selectedItem.enumValues : '',
        isEnum: selectedItem ? selectedItem.isEnum : true,
      }),
      [selectedItem, drawerData]
    ),
  });
  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form
        autoComplete="off"
        onSubmit={methods.handleSubmit(handleSubmit)}
        className={classes.form}
        {...rest}>
        <Box>
          <FormInputText
            textFieldProps={{
              InputProps: { readOnly: readOnly && !!selectedItem },
            }}
            rules={{
              required: 'Name is required',
              pattern: { value: /^\S*$/, message: 'No whitespace allowed' },
            }}
            label={'field Name'}
            name={'name'}
          />
          <Typography variant={'subtitle2'} className={classes.info}>
            It will appear in the entry editor
          </Typography>
        </Box>
        <Box>
          <FormInputSelect
            rules={{ required: 'Type is required' }}
            name={'type'}
            label={'Type'}
            options={selectItems}
          />
          <Typography variant={'subtitle2'} className={classes.info}>
            Select the type of enum values
          </Typography>
        </Box>
        <Box>
          <FormInputText
            rules={{ required: 'Options are required' }}
            label={'Options'}
            name={'enumValues'}
            textFieldProps={{ multiline: true, rows: 4 }}
          />
          <Typography variant={'subtitle2'} className={classes.info}>
            (Define one option per line)
          </Typography>
        </Box>

        <Box>
          <Grid container justifyContent={'space-between'} alignItems={'center'}>
            <Typography>Required</Typography>
            <FormInputSwitch name={'required'} />
          </Grid>
          <Typography variant={'subtitle2'} className={classes.info}>
            If active, this field will be required
          </Typography>
        </Box>
        <Box>
          <Grid container justifyContent={'space-between'} alignItems={'center'}>
            <Typography>Select</Typography>
            <FormInputSwitch name={'select'} />
          </Grid>
          <Typography variant={'subtitle2'} className={classes.info}>
            This option defines if the field you be returned from the database
          </Typography>
        </Box>

        <Box display={'flex'} width={'100%'}>
          <Button variant="contained" color="primary" type="submit" style={{ marginRight: 16 }}>
            OK
          </Button>
          <Button variant="contained" onClick={onClose}>
            CANCEL
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EnumForm;
