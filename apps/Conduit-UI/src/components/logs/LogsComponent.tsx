import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
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
import { useAppDispatch, useAppSelector } from '../../redux/store';
import moment, { Moment } from 'moment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { debounce, throttle } from 'lodash';
import CloseIcon from '@mui/icons-material/Close';
import {
  asyncGetInstances,
  asyncGetLevels,
  asyncGetQueryRange,
  // asyncLoadMoreQueryRange,
} from '../../redux/slices/LogsSlice';
import { ModulesTypes, moduleTitle } from '../../models/logs/LogsModels';

interface Props {
  module: ModulesTypes;
  open: boolean;
  onClose: () => void;
}

const Limits = [100, 500, 1000];

const LogsComponent: React.FC<Props> = ({ module, open, onClose }) => {
  const dispatch = useAppDispatch();
  const logsLevels: string[] = useAppSelector((state) => state.logsSlice?.levels);
  const instances: string[] = useAppSelector((state) => state.logsSlice?.instances);
  const values = useAppSelector((state) => state.logsSlice?.logs?.[module]);

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
          module: module,
          levels: selectedLevels,
          instances: selectedInstances,
          startDate: startDateValue ? startDateValue.valueOf() * 1000000 : undefined,
          endDate: endDateValue ? endDateValue.valueOf() * 1000000 : undefined,
          limit: selectedLimit,
        })
      );
      dispatch(
        asyncGetLevels({
          startDate: startDateValue ? startDateValue.valueOf() * 1000000 : undefined,
          endDate: endDateValue ? endDateValue.valueOf() * 1000000 : undefined,
        })
      );
      dispatch(
        asyncGetInstances({
          startDate: startDateValue ? startDateValue.valueOf() * 1000000 : undefined,
          endDate: endDateValue ? endDateValue.valueOf() * 1000000 : undefined,
        })
      );
    }, 1000),
    [startDateValue, endDateValue, selectedInstances, selectedLevels, selectedLimit, module]
  );

  useEffect(() => {
    requestDebounce();
    return () => requestDebounce.cancel();
  }, [
    dispatch,
    endDateValue,
    module,
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

  const refreshRequest = useCallback(
    throttle(
      () =>
        dispatch(
          asyncGetQueryRange({
            module: module,
            levels: selectedLevels,
            instances: selectedInstances,
            startDate: startDateValue ? startDateValue.valueOf() * 1000000 : undefined,
            endDate: endDateValue ? endDateValue.valueOf() * 1000000 : undefined,
            limit: selectedLimit,
          })
        ),
      1000
    ),
    [selectedInstances, selectedLimit, selectedLevels, module, endDateValue, startDateValue]
  );

  const handleRefresh = useCallback(() => {
    refreshRequest();
  }, [refreshRequest]);

  const handleClearStartDateTime = () => {
    if (endDateValue && endDateValue.isBefore(moment().subtract(1, 'hours'))) {
      setEndDateValue(null);
    }
    setStartDateValue(null);
  };

  const handleClearEndDateTime = () => {
    if (startDateValue && startDateValue.isBefore(moment().subtract(30, 'days'))) {
      setStartDateValue(moment().subtract(30, 'days'));
    }
    setEndDateValue(null);
  };

  const minDateOfStart = useMemo(() => {
    return endDateValue ? moment(endDateValue).subtract(30, 'days') : moment().subtract(30, 'days');
  }, [endDateValue]);

  const maxDateOfStart = useMemo(() => {
    return endDateValue
      ? moment(endDateValue).subtract(1, 'minutes')
      : moment().subtract(1, 'minutes');
  }, [endDateValue]);

  const minDateOfEnd = useMemo(() => {
    return startDateValue
      ? moment(startDateValue).add(1, 'minutes')
      : moment().subtract(59, 'minutes');
  }, [startDateValue]);

  const maxDateOfEnd = useMemo(() => {
    return startDateValue ? moment(startDateValue).add(30, 'days') : undefined;
  }, [startDateValue]);

  // const loadMore = useCallback(() => {
  //   const firstItemTime = values?.[values.length - 1]?.timestamp;
  //   if (
  //     firstItemTime &&
  //     firstItemTime >
  //       (startDateValue
  //         ? startDateValue.valueOf() * 1000000
  //         : moment().subtract(1, 'hours').valueOf() * 1000000)
  //   ) {
  //     dispatch(
  //       asyncLoadMoreQueryRange({
  //         module: module,
  //         levels: selectedLevels,
  //         instances: selectedInstances,
  //         startDate: startDateValue ? startDateValue.valueOf() * 1000000 : undefined,
  //         endDate: firstItemTime,
  //         limit: selectedLimit,
  //       })
  //     );
  //   }
  // }, [dispatch, module, values, selectedInstances, selectedLevels, selectedLimit, startDateValue]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={'lg'}>
      <DialogTitle>
        {moduleTitle(module)} Logs
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            mt: 1,
          }}>
          <Grid container spacing={2} alignItems={'center'} justifyContent={'stretch'}>
            <Grid item xl={1} md={2} xs={12}>
              <IconButton aria-label="refresh" onClick={() => handleRefresh()}>
                <RefreshIcon />
              </IconButton>
            </Grid>
            <Grid item xl={3} md={5} xs={12}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateTimePicker
                  disableFuture={true}
                  minDateTime={minDateOfStart}
                  maxDateTime={maxDateOfStart}
                  DialogProps={{
                    disableRestoreFocus: true,
                  }}
                  onClose={() => setIsStartDatePickerOpen(false)}
                  onOpen={() => setIsStartDatePickerOpen(true)}
                  open={isStartDatePickerOpen}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      fullWidth
                      InputLabelProps={{ ...props.InputLabelProps, shrink: true }}
                      label={'Start Date'}
                      inputProps={{ ...props.inputProps, placeholder: 'one hour ago' }}
                      onClick={() => setIsStartDatePickerOpen(true)}
                    />
                  )}
                  value={startDateValue}
                  onAccept={(newValue) => {
                    handleStartDateChange(newValue);
                  }}
                  onChange={() => {
                    return;
                  }}
                  InputProps={{
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
            </Grid>
            <Grid item xl={3} md={5} xs={12}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateTimePicker
                  disableFuture={true}
                  maxDateTime={maxDateOfEnd}
                  minDateTime={minDateOfEnd}
                  DialogProps={{
                    disableRestoreFocus: true,
                  }}
                  onClose={() => setIsEndDatePickerOpen(false)}
                  onOpen={() => setIsEndDatePickerOpen(true)}
                  open={isEndDatePickerOpen}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      fullWidth
                      InputLabelProps={{ ...props.InputLabelProps, shrink: true }}
                      label={'End Date'}
                      inputProps={{ ...props.inputProps, placeholder: 'now' }}
                      onClick={() => setIsEndDatePickerOpen(true)}
                    />
                  )}
                  value={endDateValue}
                  onAccept={(newValue) => {
                    handleEndDateChange(newValue);
                  }}
                  onChange={() => {
                    return;
                  }}
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
            </Grid>
            <Grid item xl={1} md={2} xs={12}>
              <FormControl fullWidth>
                <InputLabel id="demo-multiple-checkbox-label">Limit</InputLabel>
                <Select
                  fullWidth
                  sx={{ borderRadius: 3 }}
                  name={'limit'}
                  label={'Limit'}
                  value={selectedLimit}
                  disabled={Limits?.length === 0}
                  onChange={handleChangeLimit}
                  renderValue={(selected) => selected.toString()}>
                  {Limits.map((item, index) => (
                    <MenuItem key={index} value={item}>
                      <ListItemText primary={item} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xl={2} md={5} xs={12}>
              <FormControl fullWidth>
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
            </Grid>
            <Grid item xl={2} md={5} xs={12}>
              <FormControl fullWidth>
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
            </Grid>
          </Grid>
        </Toolbar>
        <Box
          sx={{
            display: 'flex',
            height: '40vh',
            background: 'black',
            mt: 2,
            borderRadius: 2,
            paddingX: 1,
          }}>
          {values?.length ? (
            <LogsList
              data={values}
              // loadMore={loadMore}
            />
          ) : (
            <Box
              display={'flex'}
              flexDirection={'column'}
              flex={1}
              alignItems={'center'}
              justifyContent={'center'}>
              <Typography>No data to show</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LogsComponent;
