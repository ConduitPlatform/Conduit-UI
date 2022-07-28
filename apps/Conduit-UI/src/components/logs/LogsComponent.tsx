import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Checkbox,
  InputLabel,
  Select,
  SelectChangeEvent,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AdapterMoment from '@mui/lab/AdapterMoment';
import ListItemText from '@mui/material/ListItemText';
import LogsList from './LogsList';
import Paper from '@mui/material/Paper';
import { useAppSelector } from '../../redux/store';

const LogsComponent: React.FC = () => {
  const [labels, setLabels] = useState<string[]>([]);
  const [selectedInstances, setInstances] = useState<string[]>([]);
  const [startDateValue, setStartDateValue] = useState<Date | null>(new Date());
  const [endDateValue, setEndDateValue] = useState<Date | null>(new Date());
  const loaderRef = useRef<any>(null);
  const levels = useAppSelector((state) => state.authenticationSlice?.data?.logs.levels);
  const instances = useAppSelector((state) => state.authenticationSlice?.data?.logs.instances);
  const values = useAppSelector((state) => state.authenticationSlice?.data?.logs.query);

  const handleChangeLabels = (event: SelectChangeEvent<typeof labels>) => {
    const {
      target: { value },
    } = event;
    setLabels(value);
  };

  const handleChangeInstances = (event: SelectChangeEvent<typeof instances>) => {
    const {
      target: { value },
    } = event;
    setInstances(value);
  };

  const handleStartDateChange = (newValue: Date | null) => {
    setStartDateValue(newValue);
  };
  const handleEndDateChange = (newValue: Date | null) => {
    setEndDateValue(newValue);
  };

  const prepareData = useMemo(() => {
    const arr: Array<Array<string>> = [];
    values?.forEach((item) =>
      item?.values?.forEach((value) =>
        arr.push([...value, item?.stream?.level, item?.stream?.instance])
      )
    );
    return arr;
  }, [values]);

  return (
    <Paper sx={{ p: 4, borderRadius: 8 }}>
      <Toolbar
        disableGutters
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
        <Typography>Logs</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <FormControl sx={{ m: 1, width: 150 }}>
            <InputLabel id="demo-multiple-checkbox-label">Instance</InputLabel>
            <Select
              sx={{ borderRadius: 3 }}
              name={'Instance'}
              label={'Instance'}
              value={selectedInstances}
              multiple
              disabled={instances?.length === 0}
              onChange={handleChangeInstances}
              renderValue={(selected) => selected.join(', ')}>
              {instances.map((item, index) => (
                <MenuItem key={index} value={item}>
                  <Checkbox checked={selectedInstances.indexOf(item) > -1} />
                  <ListItemText primary={item} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ mr: 1, mt: 1, width: 120 }}>
            <InputLabel id="demo-multiple-checkbox-label">Level</InputLabel>
            <Select
              sx={{ borderRadius: 3 }}
              name={'Level'}
              label={'Level'}
              value={labels}
              multiple
              disabled={levels?.length === 0}
              onChange={handleChangeLabels}
              renderValue={(selected) => selected.join(', ')}>
              {levels?.map((item, index) => (
                <MenuItem key={index} value={item}>
                  <Checkbox checked={labels.indexOf(item) > -1} />
                  <ListItemText primary={item} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 450 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                renderInput={(props) => <TextField {...props} />}
                label="DateTimePicker"
                value={startDateValue}
                onChange={(newValue) => {
                  handleStartDateChange(newValue);
                }}
              />
            </LocalizationProvider>
            <Typography sx={{ marginX: 1 }}>to</Typography>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                renderInput={(props) => <TextField {...props} />}
                label="DateTimePicker"
                value={endDateValue}
                onChange={(newValue) => {
                  handleEndDateChange(newValue);
                }}
              />
            </LocalizationProvider>
          </Box>
        </Box>
      </Toolbar>
      <Box
        sx={{
          height: '65vh',
          background: 'background.paper',
          display: 'flex',
        }}>
        {prepareData?.length ? (
          <LogsList data={prepareData} loaderRef={loaderRef} />
        ) : (
          <Typography
            sx={{ display: 'flex', flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
            No data to show
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default LogsComponent;
