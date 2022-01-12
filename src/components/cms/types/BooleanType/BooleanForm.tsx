import React, { FC, MouseEventHandler, useMemo } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { IBooleanData, IDrawerData } from '../../../../models/cms/BuildTypesModels';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../../../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../../../common/FormComponents/FormInputSwitch';
import { FormInputCheckBox } from '../../../common/FormComponents/FormInputCheckbox';

const useStyles = makeStyles((theme) => ({
  info: {
    opacity: '0.5',
  },
  form: {
    display: 'grid',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

interface IProps {
  drawerData: IDrawerData;
  readOnly: boolean;
  onSubmit: (booleanData: {
    //todo add IBooleanData
    default: boolean;
    select: boolean;
    unique: boolean;
    name: string;
    placeholderFalse: string;
    isArray: boolean;
    placeholderTrue: string;
    type: 'Text' | 'Number' | 'Date' | 'Boolean' | 'Enum' | 'ObjectId' | 'Group' | 'Relation';
    required: boolean;
  }) => void;
  onClose: MouseEventHandler;
  selectedItem: IBooleanData;
}

const BooleanForm: FC<IProps> = ({
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
        placeholderFalse: selectedItem ? selectedItem.placeholderFalse : '',
        placeholderTrue: selectedItem ? selectedItem.placeholderTrue : '',
        type: selectedItem ? selectedItem.type : drawerData.type,
        default: selectedItem ? selectedItem.default : false,
        unique: selectedItem ? selectedItem.unique : false,
        select: selectedItem ? selectedItem.select : true,
        required: selectedItem ? selectedItem.required : false,
        isArray: selectedItem ? selectedItem.isArray : false,
      };
    }, [selectedItem, drawerData]),
  });
  const defaultValue = methods.watch('default');

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
            This is the name of the field in the schema model
          </Typography>
        </Box>
        <Box>
          <FormInputText
            rules={{ required: 'Placeholder is required' }}
            label={'False Placeholder'}
            name={'placeholderFalse'}
          />
          <Typography variant={'subtitle2'} className={classes.info}>
            Placeholder to appear in the editor
          </Typography>
        </Box>
        <Box>
          <FormInputText
            rules={{ required: 'Placeholder is required' }}
            label={'True Placeholder'}
            name={'placeholderTrue'}
          />
          <Typography variant={'subtitle2'} className={classes.info}>
            Placeholder to appear in the editor
          </Typography>
        </Box>
        <Box>
          <Grid container justifyContent={'space-between'} alignItems={'center'}>
            <Typography>Default Value</Typography>
            <Box display={'flex'} alignItems={'center'}>
              <FormInputSwitch name={'default'} />
              <Typography>{defaultValue ? 'True' : 'False'}</Typography>
            </Box>
          </Grid>
          <Typography variant={'subtitle2'} className={classes.info}>
            The default value of the field
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
            <FormInputCheckBox name={'isArray'} label={''} />
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

export default BooleanForm;
