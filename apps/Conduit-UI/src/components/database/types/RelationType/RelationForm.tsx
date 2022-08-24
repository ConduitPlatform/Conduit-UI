import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { FC, useEffect, useState } from 'react';
import { asyncGetSchemas } from '../../../../redux/slices/databaseSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { IDrawerData, IRelationData } from '../../../../models/database/BuildTypesModels';
import { InfoTypography, StyledForm } from '../SimpleType/SimpleForm';
import { Schema } from '../../../../models/database/CmsModels';

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
  disabledProps: boolean;
}

const RelationForm: FC<IProps> = ({
  drawerData,
  readOnly,
  onSubmit,
  onClose,
  selectedItem,
  disabledProps,
  ...rest
}) => {
  const dispatch = useAppDispatch();

  const {
    schemas: { schemaDocuments },
    selectedSchema,
  } = useAppSelector((state) => state.databaseSlice.data);

  const [simpleData, setSimpleData] = useState({
    name: selectedItem ? selectedItem.name : '',
    type: selectedItem ? selectedItem.type : drawerData.type,
    select: selectedItem ? selectedItem.select : true,
    required: selectedItem ? selectedItem.required : false,
    isArray: selectedItem ? selectedItem.isArray : false,
    model: selectedItem ? selectedItem.model : '',
  });
  const [availableSchemas, setAvailableSchemas] = useState<any>([]);

  useEffect(() => {
    dispatch(asyncGetSchemas({ skip: 0, limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    let activeModules = schemaDocuments.filter(
      (s: Schema) => !s.modelOptions.conduit.cms || s.modelOptions.conduit.cms.enabled
    );
    if (selectedSchema) {
      activeModules = schemaDocuments.filter((s: Schema) => s.name !== selectedSchema.name);
    }

    setAvailableSchemas([...activeModules]);
  }, [schemaDocuments, selectedSchema]);

  const handleFieldName = (event: { target: { value: string } }) => {
    setSimpleData({ ...simpleData, name: event.target.value.split(' ').join('') });
  };

  const handleFieldRequired = () => {
    setSimpleData({ ...simpleData, required: !simpleData.required });
  };

  const handleFieldSelect = () => {
    setSimpleData({ ...simpleData, select: !simpleData.select });
  };

  const handleFieldIsArray = () => {
    setSimpleData({ ...simpleData, isArray: !simpleData.isArray });
  };

  const handleFieldRelation = (event: any) => {
    setSimpleData({ ...simpleData, model: event.target.value as string });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    onSubmit(simpleData);
    event.preventDefault();
  };

  return (
    <StyledForm autoComplete="off" onSubmit={handleSubmit} {...rest}>
      <TextField
        id="Field Name"
        label="Field Name"
        onChange={handleFieldName}
        value={simpleData.name}
        variant="outlined"
        sx={{ mb: 1 }}
        fullWidth
        required
        InputProps={{
          readOnly: readOnly && !!selectedItem,
        }}
        helperText={'It will appear in the entry editor'}
      />
      <Box width={'100%'}>
        <Grid container>
          <Grid item xs={12}>
            <Box
              width={'100%'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <Typography variant={'button'} sx={{ width: '100%' }}>
                Required
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    disabled={disabledProps}
                    checked={simpleData.required}
                    onChange={handleFieldRequired}
                    color="primary"
                  />
                }
                label=""
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <InfoTypography variant={'body2'}>
              If active, this field will be required
            </InfoTypography>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12}>
            <Box
              width={'100%'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <Typography variant={'button'} sx={{ width: '100%' }}>
                Select
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={simpleData.select}
                    onChange={handleFieldSelect}
                    color="primary"
                  />
                }
                label=""
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <InfoTypography variant={'body2'}>
              This option defines if the field should be returned from the database
            </InfoTypography>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12}>
            <Box
              width={'100%'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <Typography variant={'button'} sx={{ width: '100%' }}>
                Array
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={simpleData.isArray}
                    onChange={handleFieldIsArray}
                    color="primary"
                  />
                }
                label=""
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <InfoTypography variant={'body2'}>
              Activate this option if you want your field to be of type Array
            </InfoTypography>
          </Grid>
        </Grid>
      </Box>
      <FormControl sx={{ margin: 1, minWidth: 120, maxWidth: 300 }} variant={'outlined'} fullWidth>
        <InputLabel id="field-type">Relation</InputLabel>
        <Select
          labelId="field-relation"
          id="field relation"
          label={'Relation'}
          value={simpleData.model}
          onChange={handleFieldRelation}
          renderValue={() => simpleData.model}
          MenuProps={MenuProps}>
          {availableSchemas.map((schema: any) => (
            <MenuItem key={schema.name} value={schema.name}>
              <Checkbox checked={simpleData.model === schema.name} color={'primary'} />
              <ListItemText primary={schema.name} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select the Relation type</FormHelperText>
      </FormControl>

      <Box display={'flex'} width={'100%'}>
        <Button variant="contained" color="primary" type="submit" sx={{ marginRight: 4 }}>
          OK
        </Button>
        <Button variant="outlined" onClick={onClose}>
          CANCEL
        </Button>
      </Box>
    </StyledForm>
  );
};

export default RelationForm;
