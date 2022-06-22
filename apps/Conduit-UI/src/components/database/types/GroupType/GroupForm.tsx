import React, { FC, useState } from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import { IDrawerData, IGroupData } from '../../../../models/database/BuildTypesModels';
import { InfoTypography, StyledForm } from '../SimpleType/SimpleForm';

interface IProps {
  drawerData: IDrawerData;
  readOnly: boolean;
  onSubmit: (data: any) => void;
  onClose: () => void;
  selectedItem: IGroupData;
  disabledProps: boolean;
}

const GroupForm: FC<IProps> = ({
  drawerData,
  readOnly,
  onSubmit,
  onClose,
  selectedItem,
  disabledProps,
  ...rest
}) => {
  const [groupData, setGroupData] = useState({
    name: selectedItem ? selectedItem.name : '',
    content: selectedItem ? selectedItem.content : [],
    type: selectedItem ? selectedItem.type : drawerData.type,
    unique: selectedItem ? selectedItem.unique : false,
    select: selectedItem ? selectedItem.select : true,
    required: selectedItem ? selectedItem.required : false,
    isArray: selectedItem ? selectedItem.isArray : false,
  });

  //TODO remove: produces maximum callstack
  // useEffect(() => {
  //   setGroupData({ ...groupData, type: drawerData.type });
  // }, [drawerData.open, drawerData.type, groupData]);

  const handleFieldName = (event: { target: { value: string } }) => {
    setGroupData({ ...groupData, name: event.target.value.split(' ').join('') });
  };

  const handleFieldRequired = () => {
    setGroupData({ ...groupData, required: !groupData.required });
  };

  const handleFieldSelect = () => {
    setGroupData({ ...groupData, select: !groupData.select });
  };

  const handleFieldIsArray = () => {
    setGroupData({ ...groupData, isArray: !groupData.isArray });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    onSubmit(groupData);
    event.preventDefault();
  };

  return (
    <StyledForm autoComplete="off" onSubmit={handleSubmit} {...rest}>
      <TextField
        id="Field Name"
        label="Field Name"
        onChange={handleFieldName}
        value={groupData.name}
        variant="outlined"
        sx={{ mb: 1 }}
        fullWidth
        required
        InputProps={{
          readOnly: readOnly && !!selectedItem,
        }}
        helperText={'It will appear in the entry editor'}
      />

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
                  checked={groupData.required}
                  onChange={handleFieldRequired}
                  color="primary"
                />
              }
              label=""
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <InfoTypography variant={'body2'}>If active, this field will be required</InfoTypography>
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
                <Switch checked={groupData.select} onChange={handleFieldSelect} color="primary" />
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
                  checked={groupData.isArray}
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

export default GroupForm;
