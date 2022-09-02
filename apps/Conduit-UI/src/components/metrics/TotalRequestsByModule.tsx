import { Close } from '@mui/icons-material';
import { DateTimePicker, LocalizationProvider } from '@mui/lab';
import AdapterMoment from '@mui/lab/AdapterMoment';
import { Box, IconButton, TextField } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import moment, { Moment } from 'moment';
import dynamic from 'next/dynamic';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetMetricsQuery } from '../../redux/slices/metricsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
  module: ModulesTypes;
}

const TotalRequestsByModule: FC<Props> = ({ module }) => {
  const dispatch = useAppDispatch();

  const [startDateValue, setStartDateValue] = useState<Moment | null>(null);
  const [endDateValue, setEndDateValue] = useState<Moment | null>(null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState<boolean>(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState<boolean>(false);

  const data = useAppSelector((state) => state?.metricsSlice?.metrics?.[module]?.[0]);

  useEffect(() => {
    dispatch(
      asyncGetMetricsQuery({
        module,
        startDate: startDateValue ? startDateValue.valueOf() / 1000 : undefined,
        endDate: endDateValue ? endDateValue.valueOf() * 1000000 : undefined,
        step: '400',
      })
    );
  }, [dispatch, module, startDateValue, endDateValue]);

  const minDateOfStart = useMemo(() => {
    return endDateValue ? moment(endDateValue).subtract(30, 'days') : moment().subtract(30, 'days');
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

  const minDateOfEnd = useMemo(() => {
    return startDateValue
      ? moment(startDateValue).add(1, 'minutes')
      : moment().subtract(59, 'minutes');
  }, [startDateValue]);

  const maxDateOfEnd = useMemo(() => {
    return startDateValue ? moment(startDateValue).add(30, 'days') : undefined;
  }, [startDateValue]);

  const options: ApexOptions = {
    chart: {
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
    title: {
      text: 'Total module requests',
      align: 'left',
    },
    theme: {
      mode: 'dark',
      palette: 'palette4',
    },
    xaxis: {
      type: 'datetime',
      categories: data?.timestamps ?? [],
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
      name: 'total requests',
      data: data?.counters ?? [],
    },
  ];

  return (
    <>
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
      </Box>
      <ReactApexChart options={options} series={series} type="line" width="100%" height="300px" />
    </>
  );
};

export default TotalRequestsByModule;
