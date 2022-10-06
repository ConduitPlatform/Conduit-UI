import {
  Box,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from '@mui/material';
import moment, { Moment } from 'moment';
import React, { FC, useState } from 'react';

interface Props {
  startDateValue: Moment | null;
  setStartDateValue: (startDateValue: Moment | null) => void;
  endDateValue: Moment | null;
  setEndDateValue: (endDateValue: Moment | null) => void;
  selectedStep: string;
  setSelectedStep: (selectedStep: string) => void;
  steps: string[];
  detailedView: boolean;
  setDetailedView: (detailedView: boolean) => void;
  graphTitle?: string;
}

//TODO commented out code to be used on a later stage

const simpleViewOptions = ['Last hour', 'Last 12h', 'Last 24h', 'Last week'];

const MetricWidgetOptions: FC<Props> = ({
  startDateValue,
  setStartDateValue,
  endDateValue,
  setEndDateValue,
  selectedStep,
  setSelectedStep,
  detailedView,
  setDetailedView,
  graphTitle,
  steps,
}) => {
  const theme = useTheme();

  // const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState<boolean>(false);
  // const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState<boolean>(false);
  const [simpleViewValue, setSimpleViewValue] = useState<string>('Last hour');

  // const minDateOfStart = useMemo(() => {
  //   return endDateValue ? moment(endDateValue).subtract(1, 'years') : moment().subtract(1, 'years');
  // }, [endDateValue]);

  // const maxDateOfStart = useMemo(() => {
  //   return endDateValue
  //     ? moment(endDateValue).subtract(1, 'minutes')
  //     : moment().subtract(1, 'minutes');
  // }, [endDateValue]);

  // const handleStartDateChange = (newValue: Moment | null) => {
  //   setStartDateValue(newValue);
  // };

  // const handleClearStartDateTime = () => {
  //   if (endDateValue && endDateValue.isBefore(moment().subtract(1, 'hours'))) {
  //     setEndDateValue(null);
  //   }
  //   setStartDateValue(null);
  // };

  // const handleClearEndDateTime = () => {
  //   if (startDateValue && startDateValue.isBefore(moment().subtract(30, 'days'))) {
  //     setStartDateValue(moment().subtract(30, 'days'));
  //   }
  //   setEndDateValue(null);
  // };

  // const handleEndDateChange = (newValue: Moment | null) => {
  //   setEndDateValue(newValue);
  // };

  // const handleChangeStep = (event: SelectChangeEvent<string>) => {
  //   const {
  //     target: { value },
  //   } = event;
  //   setSelectedStep(value as string);
  // };

  const handleChangeSimpleViewStep = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;

    setSimpleViewValue(value);

    if (value === 'Last hour') {
      setSelectedStep('10m');
      setStartDateValue(moment().subtract(1, 'hours'));
    } else if (value === 'Last 12h') {
      setSelectedStep('120m');
      setStartDateValue(moment().subtract(12, 'hours'));
    } else if (value === 'Last 24h') {
      setSelectedStep('240m');
      setStartDateValue(moment().subtract(24, 'hours'));
    } else if (value === 'Last week') {
      setSelectedStep('1480m');
      setStartDateValue(moment().subtract(7, 'days'));
    }
  };

  // const minDateOfEnd = useMemo(() => {
  //   return startDateValue
  //     ? moment(startDateValue).add(1, 'minutes')
  //     : moment().subtract(59, 'minutes');
  // }, [startDateValue]);

  // const maxDateOfEnd = useMemo(() => {
  //   return undefined;
  // }, []);

  // const handleChangeToSimple = () => {
  //   setDetailedView(false);
  //   setSimpleViewValue('Last hour');
  //   setStartDateValue(moment().subtract(1, 'hours'));
  //   setEndDateValue(moment());
  //   setSelectedStep('10m');
  // };

  // const handleChangeToDetailed = () => {
  //   setDetailedView(true);
  // };

  const titleFontSizes = {
    [theme.breakpoints.down('lg')]: {
      fontSize: '1rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.8rem',
    },
  };

  return (
    <Box px={1} display="flex" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography textAlign="center" fontWeight="bold" sx={{ fontSize: titleFontSizes }}>
          {graphTitle}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
        <FormControl size={'small'} sx={{ minWidth: 150 }}>
          <InputLabel>Duration</InputLabel>
          <Select
            sx={{ borderRadius: 3 }}
            fullWidth
            name={'Duration'}
            label={'Duration'}
            value={simpleViewValue}
            onChange={handleChangeSimpleViewStep}
            renderValue={(selected) => selected.toString()}>
            {simpleViewOptions?.map((item, index) => (
              <MenuItem key={index} value={item}>
                <ListItemText primary={item} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* <Tooltip title="The step on the simple view defaults to 10m">
          <Icon sx={{ mb: '8px' }}>
            <InfoOutlined />
          </Icon>
        </Tooltip> */}
        {/* <Tooltip title="Expanded view">
          <IconButton color="primary" onClick={() => handleChangeToDetailed()}>
            <ArrowBackIosNew />
          </IconButton>
        </Tooltip> */}
      </Box>
    </Box>
  );
};

export default MetricWidgetOptions;

{
  /* <Box display="flex" px={1} gap={2}>
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
          <Tooltip title="Return to simple view">
            <IconButton color="primary" onClick={() => handleChangeToSimple()}>
              <Close />
            </IconButton>
          </Tooltip>
        </Box> */
}
