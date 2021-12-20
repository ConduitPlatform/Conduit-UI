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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import InputLocationEnum from '../../../models/InputLocationEnum';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import { Input } from '../../../models/customEndpoints/customEndpointsModels';
import { OperationsEnum } from '../../../models/OperationsEnum';

const useStyles = makeStyles((theme) => ({
  checkBox: {
    marginBottom: theme.spacing(-1.5),
  },
}));

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
  const classes = useStyles();
  const handleInputNameChange = (event: React.ChangeEvent<{ value: any }>, index: number) => {
    const value = event.target.value;
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
      <Grid item xs={1} key={index}>
        <Typography>{index + 1}.</Typography>
      </Grid>
      <Grid item xs={3}>
        <TextField
          variant="outlined"
          placeholder={'Input name'}
          fullWidth
          label="Input name"
          disabled={!editMode}
          value={input.name}
          onChange={(event) => handleInputNameChange(event, index)}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          select
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
        </TextField>
      </Grid>
      <Grid item xs={2}>
        <TextField
          select
          label={'Location'}
          variant="outlined"
          fullWidth
          value={input.location}
          disabled={!editMode}
          onChange={(event) => handleInputLocationChange(event, index)}>
          <MenuItem aria-label="None" value="" />
          <MenuItem value={InputLocationEnum.QUERY_PARAMS}>Query params</MenuItem>
          <MenuItem value={InputLocationEnum.BODY}>Body</MenuItem>
          <MenuItem
            disabled={
              operationType === OperationsEnum.DELETE || operationType === OperationsEnum.GET
            }
            value={InputLocationEnum.URL_PARAMS}>
            URL
          </MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={1} />
      <Grid item xs={2}>
        <Box className={classes.checkBox}>
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
        <IconButton disabled={!editMode} onClick={() => handleRemoveInput(index)}>
          <RemoveCircleOutlineIcon />
        </IconButton>
      </Grid>
    </Fragment>
  ));
};

export default EndpointInputs;
