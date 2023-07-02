import React, { FC, Fragment } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { InputLocation as InputLocationEnum } from '../../models/InputLocation.enum';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Input } from '../../models/customEndpointsModels';
import { OperationsEnum } from '../../models/OperationsEnum';

interface Props {
  editMode: boolean;
  selectedInputs: any;
  operationType: any;
  setSelectedInputs: (inputs: any) => void;
  handleRemoveInput: (index: number) => void;
}

const EndpointInputs: FC<Props> = ({
  editMode,
  selectedInputs,
  operationType,
  setSelectedInputs,
  handleRemoveInput,
}) => {
  const handleInputNameChange = (event: React.ChangeEvent<{ value: any }>, index: number) => {
    const value = event.target.value.replace(/[^a-z0-9_]/gi, '');
    const currentInputs = selectedInputs.slice();
    const input = { ...currentInputs[index] };

    if (input) {
      input.name = value;
      currentInputs[index] = input;
      setSelectedInputs(currentInputs);
    }
  };

  const handleInputTypeChange = (event: React.ChangeEvent<{ value: any }>, index: number) => {
    const value = event.target.value;
    const currentInputs = selectedInputs.slice();
    const input = { ...currentInputs[index] };

    if (input) {
      input.type = value;
      currentInputs[index] = input;
      setSelectedInputs(currentInputs);
    }
  };
  const handleInputLocationChange = (event: React.ChangeEvent<{ value: any }>, index: number) => {
    const value = event.target.value;
    const currentInputs = selectedInputs.slice();
    const input = { ...currentInputs[index] };
    if (input) {
      input.location = Number(value);
      currentInputs[index] = input;
      setSelectedInputs(currentInputs);
    }
  };

  const handleInputIsArray = (event: React.ChangeEvent<{ checked: boolean }>, index: number) => {
    const value = event.target.checked;
    const currentInputs = selectedInputs.slice();
    const input = { ...currentInputs[index] };
    if (input) {
      input.array = value;
      currentInputs[index] = input;
      setSelectedInputs(currentInputs);
    }
  };

  const handleInputIsOptional = (event: React.ChangeEvent<{ checked: any }>, index: number) => {
    const value = event.target.checked;
    const currentInputs = selectedInputs.slice();
    const input = { ...currentInputs[index] };
    if (input) {
      input.optional = value;
      currentInputs[index] = input;
      setSelectedInputs(currentInputs);
    }
  };

  return selectedInputs.map((input: Input, index: number) => (
    <Fragment key={`input-${index}`}>
      <Grid item container xs={12} spacing={3} alignItems="center" justifyContent="center">
        <Grid item xs={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography>{index + 1}.</Typography>
            <TextField
              variant="outlined"
              size="small"
              placeholder={'Input name'}
              fullWidth
              label="Input name"
              disabled={!editMode}
              value={input.name}
              onChange={(event) => handleInputNameChange(event, index)}
            />
          </Box>
        </Grid>
        <Grid item xs={2}>
          <TextField
            select
            size="small"
            label={'Select Types'}
            variant="outlined"
            fullWidth
            value={input.type}
            disabled={!editMode}
            onChange={(event) => handleInputTypeChange(event, index)}>
            <MenuItem value={'String'}>String</MenuItem>
            <MenuItem value={'Number'}>Number</MenuItem>
            <MenuItem value={'Boolean'}>Boolean</MenuItem>
            <MenuItem value={'ObjectId'}>ObjectId</MenuItem>
            <MenuItem value={'Date'}>Date</MenuItem>
            <MenuItem value={'JSON'}>JSON</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={2}>
          <TextField
            select
            label={'Location'}
            variant="outlined"
            size="small"
            fullWidth
            value={input.location}
            disabled={!editMode}
            onChange={(event) => handleInputLocationChange(event, index)}>
            <MenuItem value={InputLocationEnum.QUERY_PARAMS}>Query params</MenuItem>
            <MenuItem
              disabled={
                operationType === OperationsEnum.DELETE || operationType === OperationsEnum.GET
              }
              value={InputLocationEnum.BODY}>
              Body
            </MenuItem>
            <MenuItem value={InputLocationEnum.URL_PARAMS}>URL</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={1} />
        <Grid item xs={2}>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  color={'primary'}
                  checked={input.array}
                  onChange={(event) => handleInputIsArray(event, index)}
                  name="Array"
                  size={'small'}
                  disabled={!editMode || input.location === InputLocationEnum.URL_PARAMS}
                />
              }
              label="Array"
            />
            <FormControlLabel
              control={
                <Checkbox
                  color={'primary'}
                  checked={input.optional}
                  onChange={(event) => handleInputIsOptional(event, index)}
                  name="Optional"
                  size={'small'}
                  disabled={!editMode || input.location === InputLocationEnum.URL_PARAMS}
                />
              }
              label="Optional"
            />
          </Box>
        </Grid>
        <Grid item xs={1}>
          <IconButton disabled={!editMode} onClick={() => handleRemoveInput(index)} size="large">
            <RemoveCircleOutlineIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Fragment>
  ));
};

export default EndpointInputs;
