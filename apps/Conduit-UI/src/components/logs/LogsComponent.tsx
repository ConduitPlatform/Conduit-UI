import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  Select,
  SelectChangeEvent,
  SwipeableDrawer,
  Switch,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { asyncGetLevels, asyncGetQueryRange } from '../../redux/slices/logsSlice';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { VirtuosoHandle } from 'react-virtuoso';
import ShortTextIcon from '@mui/icons-material/ShortText';
import { LoadingButton } from '@mui/lab';

interface Props {
  module: ModulesTypes;
}

const Limits = [100, 500, 1000, 5000];
const minDrawerHeight = 38;
const defaultDrawerHeight = 400;

const LogsComponent: React.FC<Props> = ({ module }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const logsLevels: string[] = useAppSelector((state) => state.logsSlice?.levels);
  const values = useAppSelector((state) => state.logsSlice?.logs?.[module]);
  const appLoading: boolean = useAppSelector((state) => state.appSlice.loading);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedLimit, setSelectedLimit] = useState<number>(100);
  const [startDateValue, setStartDateValue] = useState<Moment | null>(null);
  const [endDateValue, setEndDateValue] = useState<Moment | null>(null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState<boolean>(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState<boolean>(false);
  const [drawerHeight, setDrawerHeight] = useState<number>(minDrawerHeight);
  const [liveReloadChecked, setLiveReloadChecked] = useState<boolean>(false);
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);

  const drawerHeaderRef = useRef<HTMLDivElement>();

  const listRef = useRef<VirtuosoHandle>(null);
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const requestDebounce = useCallback(
    debounce(() => {
      dispatch(
        asyncGetQueryRange({
          module: module,
          levels: selectedLevels,
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
    }, 1000),
    [dispatch, module, selectedLevels, startDateValue, endDateValue, selectedLimit]
  );

  useEffect(() => {
    requestDebounce();
  }, [
    dispatch,
    endDateValue,
    module,
    requestDebounce,
    selectedLevels,
    selectedLimit,
    startDateValue,
  ]);

  useEffect(() => {
    listRef?.current?.scrollToIndex({
      index: values?.length - 1,
      align: 'start',
      behavior: 'auto',
    });
  }, [values]);

  const handleChangeLevels = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;
    setSelectedLevels(value as string[]);
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
            startDate: startDateValue ? startDateValue.valueOf() * 1000000 : undefined,
            endDate: endDateValue ? endDateValue.valueOf() * 1000000 : undefined,
            limit: selectedLimit,
          })
        ),
      1000
    ),
    [dispatch, module, selectedLevels, startDateValue, endDateValue, selectedLimit]
  );

  const handleRefresh = useCallback(() => {
    refreshRequest();
  }, [refreshRequest]);

  useEffect(() => {
    if (liveReloadChecked) {
      if (endDateValue) setEndDateValue(null);
      if (startDateValue) setStartDateValue(null);
      const timer = setInterval(() => requestDebounce(), 3000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [endDateValue, liveReloadChecked, requestDebounce, startDateValue]);

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

  const handleMouseMove = useCallback((e) => {
    const newHeight =
      window?.innerHeight -
      e?.clientY +
      (drawerHeaderRef?.current ? drawerHeaderRef?.current?.clientHeight / 2 : 0);

    if (newHeight >= minDrawerHeight) {
      setDrawerHeight(newHeight);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mouseup', handleMouseUp, true);
    document.removeEventListener('mousemove', handleMouseMove, true);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(() => {
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (
      drawerHeight <
        (drawerHeaderRef?.current ? drawerHeaderRef?.current?.clientHeight : 0) * 1.5 &&
      drawerHeight !== minDrawerHeight
    ) {
      setDrawerHeight(minDrawerHeight);
    }
  }, [drawerHeight]);

  const handleOpenCloseDrawer = () => {
    if (drawerHeight === minDrawerHeight) {
      setDrawerHeight(defaultDrawerHeight);
    } else {
      setDrawerHeight(minDrawerHeight);
    }
  };

  const handleChangeLiveReload = (bool: ChangeEvent<HTMLInputElement>) => {
    setLiveReloadChecked(bool.target.checked);
  };

  const handleSetExpandedMessages = useCallback(
    (itemIndex: number) => {
      const newExpandedMessages = [...expandedMessages];
      if (expandedMessages.includes(itemIndex)) {
        const index = expandedMessages.findIndex((newId) => newId === itemIndex);
        newExpandedMessages.splice(index, 1);
      } else {
        newExpandedMessages.push(itemIndex);
      }
      setExpandedMessages(newExpandedMessages);
    },
    [expandedMessages]
  );

  return (
    <SwipeableDrawer
      open={true}
      onOpen={() => {
        return;
      }}
      onClose={() => {
        return;
      }}
      anchor={'bottom'}
      swipeAreaWidth={minDrawerHeight}
      disableSwipeToOpen={false}
      hideBackdrop
      variant={'permanent'}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{ sx: { background: theme.palette.background.default, paddingX: 2 } }}
      sx={{
        height: drawerHeight,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          height: drawerHeight,
          marginLeft: smallScreen ? '60px' : '200px',
        },
      }}>
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        pt={'4px'}
        pb={'3px'}
        ref={drawerHeaderRef}>
        <Box display={'flex'} alignItems={'center'} flex={1}>
          <Typography
            sx={{
              display: 'flex',
              userSelect: 'none',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={handleOpenCloseDrawer}>
            <ShortTextIcon sx={{ mr: 1 }} />
            Logs
          </Typography>
        </Box>

        <Box display={'flex'} flex={1} alignItems={'center'} justifyContent={'center'}>
          <Box
            paddingX={4}
            paddingY={1}
            sx={{ cursor: 'ns-resize' }}
            onMouseDown={() => handleMouseDown()}>
            <div
              style={{
                width: 64,
                height: 4,
                borderRadius: 3,
                zIndex: 10,
                backgroundColor: theme.palette.mode === 'dark' ? 'white' : 'black',
              }}
            />
          </Box>
        </Box>

        <Box display={'flex'} flex={1} justifyContent={'flex-end'}>
          {drawerHeight <= minDrawerHeight ? (
            <IconButton onClick={() => setDrawerHeight(defaultDrawerHeight)} size={'small'}>
              <ExpandLessIcon fontSize={'small'} />
            </IconButton>
          ) : (
            <IconButton onClick={() => setDrawerHeight(minDrawerHeight)} size={'small'}>
              <ExpandMoreIcon fontSize={'small'} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
        <Toolbar
          disableGutters
          sx={{
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            mt: 1,
          }}>
          <Grid container spacing={2} alignItems={'center'} justifyContent={'stretch'}>
            <Grid
              item
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              xl={1}
              md={2}
              sm={6}
              xs={12}>
              <FormControlLabel
                sx={{
                  marginLeft: 0,
                  marginRight: 0,
                  '&.MuiFormControlLabel-labelPlacementStart': {
                    '.MuiFormControlLabel-label': {
                      mr: 2,
                      fontSize: '0.875rem',
                    },
                  },
                }}
                control={
                  <Switch
                    checked={liveReloadChecked}
                    onChange={handleChangeLiveReload}
                    color="primary"
                  />
                }
                labelPlacement="start"
                label={'LIVE'}
              />
            </Grid>
            <Grid item xl={1} md={2} xs={12} sm={6}>
              <LoadingButton
                onClick={() => handleRefresh()}
                endIcon={<RefreshIcon />}
                loading={appLoading || liveReloadChecked}
                loadingPosition="end"
                variant="outlined"
                fullWidth
                color={'inherit'}
                sx={{
                  fontSize: '0.875rem',
                  '&.MuiLoadingButton-root': {
                    height: 40,
                    borderRadius: 3,
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.23)'
                        : 'rgba(0, 0, 0, 0.23)',
                  },
                }}>
                Refresh
              </LoadingButton>
            </Grid>
            <Grid item xl={3} md={4} xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateTimePicker
                  disabled={liveReloadChecked}
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
                      onClick={() => {
                        if (!liveReloadChecked) setIsStartDatePickerOpen(true);
                      }}
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
            <Grid item xl={3} md={4} xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateTimePicker
                  disabled={liveReloadChecked}
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
                      onClick={() => {
                        if (!liveReloadChecked) setIsEndDatePickerOpen(true);
                      }}
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
            <Grid item xl={2} md={6} xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Limit</InputLabel>
                <Select
                  fullWidth
                  sx={{ borderRadius: 3 }}
                  name={'limit'}
                  label={'Limit'}
                  size={'small'}
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
            <Grid item xl={2} md={6} xs={12} sm={6}>
              <FormControl fullWidth size={'small'}>
                <InputLabel>Level</InputLabel>
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
            flex: 1,
            height: '100%',
            background: theme.palette.background.paper,
            borderRadius: 2,
            paddingX: 1,
            mt: 1,
          }}>
          <LogsList
            data={values}
            ref={listRef}
            expandedMessages={expandedMessages}
            setExpandedMessages={handleSetExpandedMessages}
          />
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default LogsComponent;
