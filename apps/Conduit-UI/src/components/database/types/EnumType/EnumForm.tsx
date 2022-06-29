import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { FC, useState } from 'react';
import { IDrawerData, IEnumData } from '../../../../models/database/BuildTypesModels';
import { InfoTypography, StyledForm } from '../SimpleType/SimpleForm';

interface IProps {
  drawerData: IDrawerData;
  readOnly: boolean;
  onSubmit: (data: any) => void;
  onClose: () => void;
  selectedItem: IEnumData;
  disabledProps: boolean;
}

const EnumForm: FC<IProps> = ({
  drawerData,
  readOnly,
  onSubmit,
  onClose,
  selectedItem,
  disabledProps,
  ...rest
}) => {
  const [simpleData, setSimpleData] = useState({
    name: selectedItem ? selectedItem.name : '',
    type: selectedItem ? selectedItem.type : drawerData.type,
    select: selectedItem ? selectedItem.select : true,
    required: selectedItem ? selectedItem.required : false,
    enumValues: selectedItem ? selectedItem.enumValues : '',
    isEnum: selectedItem ? selectedItem.isEnum : true,
  });

  const handleFieldName = (event: { target: { value: string } }) => {
    setSimpleData({ ...simpleData, name: event.target.value.split(' ').join('') });
  };

  const handleFieldType = (event: any) => {
    setSimpleData({ ...simpleData, type: event.target.value });
  };

  const handleFieldRequired = () => {
    setSimpleData({ ...simpleData, required: !simpleData.required });
  };

  const handleFieldSelect = () => {
    setSimpleData({ ...simpleData, select: !simpleData.select });
  };

  const handleOptions = (event: { target: { value: string } }) => {
    setSimpleData({ ...simpleData, enumValues: event.target.value });
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
        inputProps={{
          readOnly: readOnly && !!selectedItem,
        }}
        helperText={'It will appear in the entry editor'}
      />
      <FormControl sx={{ margin: 1, minWidth: 120 }} variant={'outlined'} fullWidth required>
        <InputLabel id="field-type">Type</InputLabel>
        <Select
          labelId="field-type"
          id="field type"
          label={'Type'}
          value={simpleData.type}
          onChange={handleFieldType}>
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={'Text'}>Text</MenuItem>
          <MenuItem value={'Number'}>Number</MenuItem>
        </Select>
        <FormHelperText>Select the type of enum values</FormHelperText>
      </FormControl>
      <TextField
        id="Options"
        label="Options"
        multiline
        rows="4"
        onChange={handleOptions}
        value={simpleData.enumValues}
        variant="outlined"
        sx={{ mb: 1 }}
        fullWidth
        required
        helperText={'(Define one option per line)'}
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
      </Box>

      <Box display={'flex'} width={'100%'}>
        <Button variant="contained" color="primary" type="submit" sx={{ marginRight: 4 }}>
          OK
        </Button>
        <Button onClick={onClose} variant="outlined">
          CANCEL
        </Button>
      </Box>
    </StyledForm>
  );
};

export default EnumForm;
