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
import { getRequestProm } from '../../http/requestsConfig';
import moment, { Moment } from 'moment';
import { DateTimePicker, LocalizationProvider } from '@mui/lab';
import AdapterMoment from '@mui/lab/AdapterMoment';
import Close from '@mui/icons-material/Close';
import { MetricsLogsData } from '../../models/metrics/metricsModels';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { useAppDispatch } from '../../redux/store';
import { enqueueErrorNotification } from '../../utils/useNotifier';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
  query: string;
  expression: string;
  graphTitle?: string;
  hasControls?: boolean;
  label?: string;
}

const steps = ['1s', '10s', '1m', '10m', '1h', '12h', '1w', '2w'];

const ExtractGraph: FC<Props> = ({
  query,
  expression,
  graphTitle,
  hasControls = true,
  label = 'value',
}) => {
  const dispatch = useAppDispatch();

  const [startDateValue, setStartDateValue] = useState<Moment | null>(null);
  const [endDateValue, setEndDateValue] = useState<Moment | null>(null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState<boolean>(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState<boolean>(false);
  const [selectedStep, setSelectedStep] = useState<string>('10m');
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [counters, setCounters] = useState<number[]>([]);

  useEffect(() => {
    getRequestProm(query, {
      query: expression,
      start: startDateValue
        ? startDateValue.valueOf() / 1000
        : moment().subtract(1, 'hours').unix(),
      end: endDateValue ? endDateValue.valueOf() / 1000 : moment().unix(),
      step: selectedStep,
    })
      .then(({ data }) => {
        const arr: [] = [];
        const timestamps: number[] = [];
        const counters: number[] = [];

        data?.data?.result.forEach((e: MetricsLogsData) => {
          e.values.forEach((item) => {
            arr.push(item);
          });
        });

        arr.map((item) => {
          const itemsTime = item?.[0] as Moment;
          const itemsCount = item?.[1];

          timestamps.push(moment(itemsTime.valueOf() * 1000).valueOf());
          counters.push(parseInt(itemsCount));
        });

        setTimestamps(timestamps);
        setCounters(counters);
      })
      .catch((err) => dispatch(enqueueErrorNotification(err.data.error)));
  }, [endDateValue, startDateValue, selectedStep, expression, query, dispatch]);

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

  const options: ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },

      id: 'basic-bar',
      fontFamily: 'JetBrains Mono',
      background: '#202030',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    title: {
      text: graphTitle ?? '',
      align: 'left',
    },
    theme: {
      mode: 'dark',
      palette: 'palette4',
    },
    xaxis: {
      type: 'datetime',
      categories: timestamps ?? [],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 100],
        colorStops: [],
      },
    },
    stroke: {
      show: true,
      curve: 'smooth',
      lineCap: 'butt',
      colors: undefined,
      width: 2,
      dashArray: 0,
    },
  };

  const series = [
    {
      name: label,
      data: counters ?? [],
    },
  ];

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
      <ReactApexChart options={options} series={series} type="line" width="100%" height="300px" />
    </>
  );
};

export default ExtractGraph;
