import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import moment, { Moment } from 'moment';
import { DateTimePicker, LocalizationProvider } from '@mui/lab';
import AdapterMoment from '@mui/lab/AdapterMoment';
import Close from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import AreaChart from '../charts/AreaChart';
import { asyncGetGenericMetricQueryRange } from '../../redux/slices/metricsSlice';

interface Props {
  expression: string;
  graphTitle?: string;
  hasControls?: boolean;
  label?: string;
  canZoom?: boolean;
}

const steps = ['1s', '10s', '1m', '10m', '1h', '12h', '1w', '2w'];

const ExtractQueryRangeGraph: FC<Props> = ({
  expression,
  graphTitle,
  hasControls = true,
  label = 'value',
  canZoom = true,
}) => {
  const dispatch = useAppDispatch();

  const [startDateValue, setStartDateValue] = useState<Moment | null>(null);
  const [endDateValue, setEndDateValue] = useState<Moment | null>(null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState<boolean>(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState<boolean>(false);
  const [selectedStep, setSelectedStep] = useState<string>('10m');

  const data = useAppSelector((state) => state?.metricsSlice?.data?.genericMetric?.[expression]);

  const loading = useAppSelector(
    (state) => state?.metricsSlice?.meta.genericMetricLoading?.[expression]
  );

  useEffect(() => {
    dispatch(
      asyncGetGenericMetricQueryRange({
        expression,
        startDate: startDateValue
          ? startDateValue.valueOf() / 1000
          : moment().subtract(1, 'hours').unix(),
        endDate: endDateValue ? endDateValue.valueOf() / 1000 : moment().unix(),
        step: selectedStep,
      })
    );
  }, [dispatch, expression, startDateValue, endDateValue, selectedStep]);

  const minDateOfStart = useMemo(() => {
    return endDateValue ? moment(endDateValue).subtract(1, 'years') : moment().subtract(1, 'years');
  }, [endDateValue]);

  const maxDateOfStart = useMemo(() => {
    return endDateValue
      ? moment(endDateValue).subtract(1, 'minutes')
      : moment().subtract(1, 'minutes');
  }, [endDateValue]);

  const handleStartDateChange = (newValue: Moment | null) => {
    setStartDateValue(newValue);
  };

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

  const handleEndDateChange = (newValue: Moment | null) => {
    setEndDateValue(newValue);
  };

  const handleChangeStep = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;
    setSelectedStep(value as string);
  };

  const minDateOfEnd = useMemo(() => {
    return startDateValue
      ? moment(startDateValue).add(1, 'minutes')
      : moment().subtract(59, 'minutes');
  }, [startDateValue]);

  const maxDateOfEnd = useMemo(() => {
    return undefined;
  }, []);

  return (
    <>
      {hasControls && (
        <Box display="flex" py={1} gap={2}>
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
                  size={'small'}
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
                    <Close color={'inherit'} />
                  </IconButton>
                ),
              }}
            />
          </LocalizationProvider>
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
                  size={'small'}
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
                    <Close color={'inherit'} />
                  </IconButton>
                ),
              }}
            />
          </LocalizationProvider>
          <FormControl size={'small'} sx={{ minWidth: 88 }}>
            <InputLabel>Step</InputLabel>
            <Select
              sx={{ borderRadius: 3 }}
              fullWidth
              name={'Step'}
              label={'Step'}
              value={selectedStep}
              onChange={handleChangeStep}
              renderValue={(selected) => selected.toString()}>
              {steps?.map((item, index) => (
                <MenuItem key={index} value={item}>
                  <ListItemText primary={item} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      <AreaChart
        label={label}
        timestamps={data?.timestamps}
        counters={data?.counters}
        graphTitle={graphTitle}
        canZoom={canZoom}
        loading={loading}
      />
    </>
  );
};

export default ExtractQueryRangeGraph;
