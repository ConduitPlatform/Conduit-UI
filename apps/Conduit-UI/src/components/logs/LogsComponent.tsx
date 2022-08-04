import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  IconButton,
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
import { useAppDispatch, useAppSelector } from '../../redux/store';
import moment, { Moment } from 'moment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { debounce, throttle } from 'lodash';
import CloseIcon from '@mui/icons-material/Close';
import {
  asyncGetInstances,
  asyncGetLevels,
  asyncGetQueryRange,
} from '../../redux/slices/LogsSlice';
import { ModulesTypes } from '../../models/logs/LogsModels';

interface Props {
  moduleName: ModulesTypes;
}

const Limits = [50, 100, 300, 500, 1000];

const LogsComponent: React.FC<Props> = ({ moduleName }) => {
  const dispatch = useAppDispatch();
  const logsLevels = useAppSelector((state) => state.logsSlice?.levels);
  const instances = useAppSelector((state) => state.logsSlice?.instances);
  const values = useAppSelector((state) => state.logsSlice?.logs?.[moduleName]);

  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedInstances, setInstances] = useState<string[]>([]);
  const [selectedLimit, setSelectedLimit] = useState<number>(100);
  const [startDateValue, setStartDateValue] = useState<Moment | null>(null);
  const [endDateValue, setEndDateValue] = useState<Moment | null>(null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState<boolean>(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState<boolean>(false);

  const requestDebounce = useCallback(
    debounce(() => {
      dispatch(
        asyncGetQueryRange({
          module: moduleName,
          levels: selectedLevels,
          instances: selectedInstances,
          startDate: startDateValue ? moment(startDateValue).valueOf() * 1000000 : undefined,
          endDate: endDateValue ? moment(endDateValue).valueOf() * 1000000 : undefined,
          limit: selectedLimit,
        })
      );
      dispatch(
        asyncGetLevels({
          startDate: startDateValue ? moment(startDateValue).valueOf() * 1000000 : undefined,
        })
      );
      dispatch(
        asyncGetInstances({
          startDate: startDateValue ? moment(startDateValue).valueOf() * 1000000 : undefined,
        })
      );
    }, 1000),
    [startDateValue, endDateValue, selectedInstances, selectedLevels, selectedLimit, moduleName]
  );

  useEffect(() => {
    requestDebounce();
    return () => requestDebounce.cancel();
  }, [
    dispatch,
    endDateValue,
    moduleName,
    requestDebounce,
    selectedInstances,
    selectedLevels,
    selectedLimit,
    startDateValue,
  ]);

  const handleChangeLevels = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;
    setSelectedLevels(value as string[]);
  };

  const handleChangeInstances = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;
    setInstances(value as string[]);
  };

  const handleStartDateChange = (newValue: Moment | null) => {
    setStartDateValue(newValue);
  };
  const handleEndDateChange = (newValue: Moment | null) => {
    setEndDateValue(newValue);
  };

  const handleChangeLimit = (newValue: SelectChangeEvent<unknown>) => {
    setSelectedLimit(newValue?.target?.value as number);
  };

  const prepareData = useMemo(() => {
    const arr: Array<Array<string>> = [];
    values?.forEach((item) =>
      item?.values?.forEach((value) => {
        arr.push([...value, item?.stream?.level, item?.stream?.instance]);
      })
    );
    return arr;
  }, [values]);

  const refreshRequest = useCallback(
    throttle(
      () =>
        dispatch(
          asyncGetQueryRange({
            module: moduleName,
            levels: selectedLevels,
            instances: selectedInstances,
            startDate: startDateValue ? moment(startDateValue).valueOf() * 1000000 : undefined,
            endDate: endDateValue ? moment(endDateValue).valueOf() * 1000000 : undefined,
            limit: selectedLimit,
          })
        ),
      1000
    ),
    [selectedInstances, selectedLimit, selectedLevels, moduleName, endDateValue, startDateValue]
  );

  const handleRefresh = useCallback(() => {
    refreshRequest();
  }, [refreshRequest]);

  const handleClearStartDateTime = () => {
    setStartDateValue(null);
  };

  const handleClearEndDateTime = () => {
    setEndDateValue(null);
  };

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 8,
        justifyContent: 'space-between',
      }}>
      <Toolbar
        disableGutters
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'stretch',
        }}>
        <Typography sx={{ fontSize: 24, mt: 2 }}>Logs</Typography>
        <Box display={'flex'} flexDirection={'column'}>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 330, mt: 2 }}>
            <IconButton aria-label="refresh" sx={{ mr: 1 }} onClick={() => handleRefresh()}>
              <RefreshIcon />
            </IconButton>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                disableFuture={true}
                maxDateTime={moment(endDateValue).subtract(1, 'minutes')}
                DialogProps={{
                  disableRestoreFocus: true,
                }}
                onClose={() => setIsStartDatePickerOpen(false)}
                onOpen={() => setIsStartDatePickerOpen(true)}
                open={isStartDatePickerOpen}
                renderInput={(props) => (
                  <TextField
                    {...props}
                    InputLabelProps={{ ...props.InputLabelProps, shrink: true }}
                    label={'Start Date'}
                    sx={{ ...props.sx, width: 302 }}
                    inputProps={{ ...props.inputProps, placeholder: 'one hour ago' }}
                    onClick={() => setIsStartDatePickerOpen(true)}
                  />
                )}
                value={startDateValue}
                onAccept={(newValue) => {
                  handleStartDateChange(newValue);
                }}
                onChange={() => {}}
                InputProps={{
                  sx: { mr: 1 },
                  startAdornment: startDateValue && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearStartDateTime();
                      }}
                      sx={{ padding: 0, marginRight: 1, cursor: 'pointer' }}>
                      <CloseIcon color={'inherit'} />
                    </IconButton>
                  ),
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                disableFuture={true}
                minDateTime={startDateValue ? startDateValue : moment().subtract(1, 'hours')}
                DialogProps={{
                  disableRestoreFocus: true,
                }}
                onClose={() => setIsEndDatePickerOpen(false)}
                onOpen={() => setIsEndDatePickerOpen(true)}
                open={isEndDatePickerOpen}
                renderInput={(props) => (
                  <TextField
                    {...props}
                    InputLabelProps={{ ...props.InputLabelProps, shrink: true }}
                    label={'End Date'}
                    sx={{ ...props.sx, width: 302 }}
                    inputProps={{ ...props.inputProps, placeholder: 'now' }}
                    onClick={() => setIsEndDatePickerOpen(true)}
                  />
                )}
                value={endDateValue}
                onAccept={(newValue) => {
                  handleEndDateChange(newValue);
                }}
                onChange={() => {}}
                InputProps={{
                  startAdornment: endDateValue && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearEndDateTime();
                      }}
                      sx={{ padding: 0, marginRight: 1, cursor: 'pointer' }}>
                      <CloseIcon color={'inherit'} />
                    </IconButton>
                  ),
                }}
              />
            </LocalizationProvider>
            <FormControl sx={{ ml: 1, minWidth: 90 }}>
              <InputLabel id="demo-multiple-checkbox-label">Limit</InputLabel>
              <Select
                sx={{ borderRadius: 3 }}
                name={'limit'}
                label={'Limit'}
                value={selectedLimit}
                disabled={Limits?.length === 0}
                onChange={handleChangeLimit}
                renderValue={(selected) => selected.toString()}>
                {Limits.map((item, index) => (
                  <MenuItem key={index} value={item}>
                    <Checkbox checked={selectedLimit === item} />
                    <ListItemText primary={item} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display={'flex'}>
            <FormControl sx={{ mt: 2, mr: 1, width: '100%' }}>
              <InputLabel id="demo-multiple-checkbox-label">Instance</InputLabel>
              <Select
                sx={{ borderRadius: 3 }}
                fullWidth
                name={'Instance'}
                label={'Instance'}
                value={selectedInstances}
                multiple
                disabled={instances?.length === 0}
                onChange={handleChangeInstances}
                renderValue={(selected) => selected.join(', ')}>
                {instances?.map((item, index) => (
                  <MenuItem key={index} value={item}>
                    <Checkbox checked={selectedInstances.indexOf(item) > -1} />
                    <ListItemText primary={item} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ mt: 2, width: '100%' }}>
              <InputLabel id="demo-multiple-checkbox-label">Level</InputLabel>
              <Select
                sx={{ borderRadius: 3 }}
                fullWidth
                name={'Level'}
                label={'Level'}
                value={selectedLevels}
                multiple
                disabled={logsLevels?.length === 0}
                onChange={handleChangeLevels}
                renderValue={(selected) => selected.join(', ')}>
                {logsLevels?.map((item, index) => (
                  <MenuItem key={index} value={item}>
                    <Checkbox checked={selectedLevels?.indexOf(item) > -1} />
                    <ListItemText primary={item} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Toolbar>
      <Box
        sx={{
          height: '55vh',
          background: 'background.paper',
          mt: 2,
        }}>
        {prepareData?.length ? (
          <LogsList data={prepareData} />
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
