import React, { FC, MouseEventHandler, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IBooleanData, IDrawerData } from '../../../models/BuildTypesModels';
import { InfoTypography, StyledForm } from '../SimpleType/SimpleForm';

interface IProps {
  drawerData: IDrawerData;
  readOnly: boolean;
  onSubmit: (booleanData: {
    //todo add IBooleanData
    default: boolean;
    select: boolean;
    unique: boolean;
    name: string;
    isArray: boolean;
    type:
      | 'Text'
      | 'Number'
      | 'Date'
      | 'Boolean'
      | 'Enum'
      | 'ObjectId'
      | 'Group'
      | 'Relation'
      | 'JSON';
    required: boolean;
  }) => void;
  onClose: MouseEventHandler;
  selectedItem: IBooleanData;
  disabledProps: boolean;
}

const BooleanForm: FC<IProps> = ({
  drawerData,
  readOnly,
  onSubmit,
  onClose,
  selectedItem,
  disabledProps,
  ...rest
}) => {
  const [booleanData, setBooleanData] = useState({
    name: selectedItem ? selectedItem.name : '',
    type: selectedItem ? selectedItem.type : drawerData.type,
    default: selectedItem ? selectedItem.default : false,
    unique: selectedItem ? selectedItem.unique : false,
    select: selectedItem ? selectedItem.select : true,
    required: selectedItem ? selectedItem.required : false,
    isArray: selectedItem ? selectedItem.isArray : false,
    // id: '',
  });

  const handleFieldName = (event: { target: { value: string } }) => {
    // const slug = slugify(event.target.value);
    setBooleanData({
      ...booleanData,
      name: event.target.value.split(' ').join(''),
      // id: slug,
    });
  };

  const handleFieldDefault = () => {
    setBooleanData({ ...booleanData, default: !booleanData.default });
  };

  const handleFieldUnique = () => {
    setBooleanData({ ...booleanData, unique: !booleanData.unique });
  };

  const handleFieldRequired = () => {
    setBooleanData({ ...booleanData, required: !booleanData.required });
  };

  const handleFieldSelect = () => {
    setBooleanData({ ...booleanData, select: !booleanData.select });
  };

  const handleFieldIsArray = () => {
    setBooleanData({ ...booleanData, isArray: !booleanData.isArray });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    onSubmit(booleanData);
    event.preventDefault();
  };

  return (
    <StyledForm autoComplete="off" onSubmit={handleSubmit} {...rest}>
      <TextField
        id="Field Name"
        label="Field Name"
        onChange={handleFieldName}
        value={booleanData.name}
        variant="outlined"
        sx={{ mb: 1 }}
        fullWidth
        required
        InputProps={{
          readOnly: readOnly && !!selectedItem,
        }}
        disabled={readOnly && !!selectedItem}
        helperText={'This is the name of the field in the schema model'}
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
                Default Value
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={booleanData.default}
                    onChange={handleFieldDefault}
                    color="primary"
                  />
                }
                label=""
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <InfoTypography variant={'subtitle1'}>The default value of the field</InfoTypography>
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
                Unique field
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    disabled={disabledProps}
                    checked={booleanData.unique}
                    onChange={handleFieldUnique}
                    color="primary"
                  />
                }
                label=""
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <InfoTypography variant={'subtitle1'}>
              {"If active, this field's value must be unique"}
            </InfoTypography>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} pb={2}>
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
                    checked={booleanData.required}
                    onChange={handleFieldRequired}
                    color="primary"
                  />
                }
                label=""
              />
            </Box>
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
                    checked={booleanData.select}
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
                  <Switch
                    checked={booleanData.isArray}
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
      <Box display={'flex'} gap={2} width={'100%'}>
        <Button variant="contained" color="primary" type="submit">
          OK
        </Button>
        <Button onClick={onClose} variant="outlined">
          CANCEL
        </Button>
      </Box>
    </StyledForm>
  );
};

export default BooleanForm;
