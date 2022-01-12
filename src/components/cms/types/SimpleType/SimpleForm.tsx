import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { FC, useMemo } from 'react';
import { IDrawerData, ISimpleData } from '../../../../models/cms/BuildTypesModels';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../../../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../../../common/FormComponents/FormInputSwitch';
import { FormInputCheckBox } from '../../../common/FormComponents/FormInputCheckbox';

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
  selectedItem: ISimpleData;
}

const SimpleForm: FC<IProps> = ({
  drawerData,
  readOnly,
  onSubmit,
  onClose,
  selectedItem,
  ...rest
}) => {
  const classes = useStyles();
  const methods = useForm({
    defaultValues: useMemo(() => {
      return {
        name: selectedItem ? selectedItem.name : '',
        default: selectedItem ? selectedItem.default : '',
        type: selectedItem ? selectedItem.type : drawerData.type,
        unique: selectedItem ? selectedItem.unique : false,
        select: selectedItem ? selectedItem.select : true,
        required: selectedItem ? selectedItem.required : false,
        isArray: selectedItem ? selectedItem.isArray : false,
      };
    }, [selectedItem, drawerData]),
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
          <FormInputText label={'field Default Value'} name={'default'} />
          <Typography variant={'subtitle2'} className={classes.info}>
            Default value of this field
          </Typography>
        </Box>
        <Box>
          <Grid container justifyContent={'space-between'} alignItems={'center'}>
            <Typography>Unique field</Typography>
            <FormInputSwitch name={'unique'} />
          </Grid>
          <Typography variant={'subtitle2'} className={classes.info}>
            {"If active, this field's value must be unique"}
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

        <Box>
          <Grid container justifyContent={'space-between'} alignItems={'center'}>
            <Typography>Array</Typography>
            <FormInputCheckBox label={''} name={'isArray'} />
          </Grid>
          <Typography variant={'subtitle2'} className={classes.info}>
            Activate this option if you want your field to be of type Array
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

export default SimpleForm;
