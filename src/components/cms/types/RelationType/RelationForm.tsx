import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { asyncGetCmsSchemas } from '../../../../redux/slices/cmsSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { IDrawerData, IRelationData } from '../../../../models/cms/BuildTypesModels';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../../../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../../../common/FormComponents/FormInputSwitch';
import { FormInputCheckBox } from '../../../common/FormComponents/FormInputCheckbox';
import { FormInputSelect } from '../../../common/FormComponents/FormInputSelect';
import { Schema } from '../../../../models/cms/CmsModels';

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface IProps {
  drawerData: IDrawerData;
  readOnly: boolean;
  onSubmit: (data: any) => void;
  onClose: () => void;
  selectedItem: IRelationData;
}

const RelationForm: FC<IProps> = ({
  drawerData,
  readOnly,
  onSubmit,
  onClose,
  selectedItem,
  ...rest
}) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const {
    schemas: { schemaDocuments },
    selectedSchema,
    schemasFromOtherModules,
  } = useAppSelector((state) => state.cmsSlice.data);

  const [availableSchemas, setAvailableSchemas] = useState<any>([]);

  const methods = useForm({
    defaultValues: useMemo(
      () => ({
        name: selectedItem ? selectedItem.name : '',
        type: selectedItem ? selectedItem.type : drawerData.type,
        select: selectedItem ? selectedItem.select : true,
        required: selectedItem ? selectedItem.required : false,
        isArray: selectedItem ? selectedItem.isArray : false,
        model: selectedItem ? selectedItem.model : '',
      }),
      [selectedItem, drawerData]
    ),
  });

  useEffect(() => {
    dispatch(asyncGetCmsSchemas({ skip: 0, limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    const systemModules = schemasFromOtherModules.map((s) => ({ ...s, enabled: true }));
    let activeModules = schemaDocuments.filter((s) => s.modelOptions.conduit.cms.enabled);
    if (selectedSchema) {
      activeModules = schemaDocuments.filter((s) => s.name !== selectedSchema.name);
    }
    setAvailableSchemas([...activeModules, ...systemModules]);
  }, [schemaDocuments, schemasFromOtherModules, selectedSchema]);

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
            textFieldProps={{ InputProps: { readOnly: readOnly && !!selectedItem } }}
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
        <Box>
          <FormInputSelect
            name={'model'}
            label={'Relation'}
            textFieldProps={{ SelectProps: { MenuProps: MenuProps } }}
            options={availableSchemas?.map((schema: Schema) => ({
              label: schema.name,
              value: schema.name,
            }))}
          />
          <Typography variant={'subtitle2'} className={classes.info}>
            Select the Relation type
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

export default RelationForm;
