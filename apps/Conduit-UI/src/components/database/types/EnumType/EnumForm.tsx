import { Add } from '@mui/icons-material';
import { Chip, IconButton, InputAdornment } from '@mui/material';
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
import React, { FC, useEffect, useState } from 'react';
import { IDrawerData, IEnumData } from '../../../../models/database/BuildTypesModels';
import { useAppDispatch } from '../../../../redux/store';
import { enqueueInfoNotification } from '../../../../utils/useNotifier';
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
  const dispatch = useAppDispatch();
  const [simpleData, setSimpleData] = useState({
    name: selectedItem ? selectedItem.name : '',
    type: selectedItem ? selectedItem.type : drawerData.type,
    select: selectedItem ? selectedItem.select : true,
    required: selectedItem ? selectedItem.required : false,
    enumValues: selectedItem ? selectedItem.enumValues : [],
    isEnum: selectedItem ? selectedItem.isEnum : true,
  });

  const [newEnumValue, setNewEnumValue] = useState<string>('');
  const [enumValues, setEnumValues] = useState<string[]>([]);

  useEffect(() => {
    if (selectedItem?.enumValues)
      setEnumValues(JSON.parse(JSON.stringify(selectedItem.enumValues)));
  }, [selectedItem]);

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

  const handleAddEnum = () => {
    if (enumValues.includes(newEnumValue)) {
      dispatch(enqueueInfoNotification(`Duplicate enum ${newEnumValue}`));
      return;
    }
    setEnumValues([...enumValues, newEnumValue]);
    setNewEnumValue('');
  };

  const handleRemoveEnum = (value: string) => {
    const newArray = enumValues.filter((enumValue) => enumValue !== value);
    setEnumValues([...newArray]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const finalizedData = { ...simpleData, enumValues };

    onSubmit(finalizedData);
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
        label="Add enum value"
        fullWidth
        value={newEnumValue}
        onChange={(e) => setNewEnumValue(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton disabled={newEnumValue === ''} onClick={() => handleAddEnum()}>
                <Add />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box display="flex" flexWrap="wrap" gap={1} p={2}>
        {enumValues.map((enumValue, index) => (
          <Chip
            color="primary"
            key={index}
            label={enumValue}
            onDelete={() => handleRemoveEnum(enumValue)}
          />
        ))}
      </Box>

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

export default EnumForm;
