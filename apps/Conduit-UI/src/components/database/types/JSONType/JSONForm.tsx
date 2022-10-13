import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { FC, useState } from 'react';
import { IDrawerData, ISimpleData } from '../../../../models/database/BuildTypesModels';
import { styled } from '@mui/material';
import JsonEditorComponent from '../../../common/JsonEditorComponent';

export const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(2),
}));

export const InfoTypography = styled(Typography)(({ theme }) => ({
  width: '100%',
  fontSize: 14,
  marginBottom: theme.spacing(3),
  opacity: '0.5',
}));

interface IProps {
  drawerData: IDrawerData;
  readOnly: boolean;
  onSubmit: (data: any) => void;
  onClose: () => void;
  selectedItem: ISimpleData;
  disabledProps: boolean;
}

const JSONForm: FC<IProps> = ({
  drawerData,
  readOnly,
  onSubmit,
  onClose,
  selectedItem,
  disabledProps,
  ...rest
}) => {
  const [jsonData, setJsonData] = useState({
    name: selectedItem ? selectedItem.name : '',
    default: selectedItem ? selectedItem.default : '',
    type: selectedItem ? selectedItem.type : drawerData.type,
    unique: selectedItem ? selectedItem.unique : false,
    select: selectedItem ? selectedItem.select : true,
    required: selectedItem ? selectedItem.required : false,
    isArray: selectedItem ? selectedItem.isArray : false,
  });

  const handleFieldName = (event: { target: { value: string } }) => {
    setJsonData({ ...jsonData, name: event.target.value.split(' ').join('') });
  };

  const handleFieldDefault = (changedText: any) => {
    setJsonData({ ...jsonData, default: changedText.jsObject });
  };

  const handleFieldUnique = () => {
    setJsonData({ ...jsonData, unique: !jsonData.unique });
  };

  const handleFieldRequired = () => {
    setJsonData({ ...jsonData, required: !jsonData.required });
  };

  const handleFieldSelect = () => {
    setJsonData({ ...jsonData, select: !jsonData.select });
  };

  const handleFieldIsArray = () => {
    setJsonData({ ...jsonData, isArray: !jsonData.isArray });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(jsonData);
  };

  return (
    <StyledForm autoComplete="off" onSubmit={handleSubmit} {...rest}>
      <TextField
        id="Field Name"
        label="Field Name"
        onChange={handleFieldName}
        value={jsonData.name}
        variant="outlined"
        sx={{ mb: 1 }}
        fullWidth
        required
        InputProps={{
          readOnly: readOnly && !!selectedItem,
        }}
        helperText={'It will appear in the entry editor'}
      />
      <Box width="100%" mb={2}>
        <Typography variant="caption">Value</Typography>
        <JsonEditorComponent
          id="default"
          placeholder={
            typeof jsonData.default === 'object' ? jsonData.default : { placeholder: '123' }
          }
          onChange={handleFieldDefault}
          height="fit-content"
          width="100%"
        />
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
                Unique field
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    disabled={disabledProps}
                    checked={jsonData.unique}
                    onChange={handleFieldUnique}
                    color="primary"
                  />
                }
                label=""
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant={'subtitle1'}
              sx={{ width: '100%', fontSize: 14, marginBottom: 3, opacity: '0.5' }}>
              {"If active, this field's value must be unique"}
            </Typography>
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
                Required
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    disabled={disabledProps}
                    checked={jsonData.required}
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
                  <Switch checked={jsonData.select} onChange={handleFieldSelect} color="primary" />
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
                    checked={jsonData.isArray}
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
        <Button variant="outlined" onClick={onClose}>
          CANCEL
        </Button>
      </Box>
    </StyledForm>
  );
};

export default JSONForm;
