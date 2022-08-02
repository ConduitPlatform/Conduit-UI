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
import {
  asyncGetAuthenticationLevels,
  asyncGetAuthenticationQueryRange,
} from '../../redux/slices/authenticationSlice';
import moment, { MomentInput } from 'moment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { debounce } from 'lodash';

const LogsComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const logsLevels = useAppSelector((state) => state.authenticationSlice?.data?.logs.levels);
  // const instances = useAppSelector((state) => state.authenticationSlice?.data?.logs.instances);
  const values = useAppSelector((state) => state.authenticationSlice?.data?.logs.query);
  const [selectedLevels, setSelectedLevels] = useState<any>(logsLevels);
  // const [selectedInstances, setInstances] = useState<string[]>([]);
  const [startDateValue, setStartDateValue] = useState<MomentInput | null>(
    moment().subtract(1, 'hours')
  );
  const [endDateValue, setEndDateValue] = useState<MomentInput | null>(moment());

  const query = useMemo(() => {
    const string = selectedLevels?.join('|');
    return string ? `{module="authentication", level=~"${string}" }` : `{module="authentication"}`;
  }, [selectedLevels]);

  useEffect(() => {
    dispatch(
      asyncGetAuthenticationQueryRange({
        query: query,
        startDate: moment(startDateValue).valueOf() * 1000000,
        endDate: moment(endDateValue).valueOf() * 1000000,
      })
    );

    dispatch(
      asyncGetAuthenticationLevels({
        query: query,
        startDate: moment(startDateValue).valueOf() * 1000000,
      })
    );
  }, [dispatch, endDateValue, query, startDateValue]);

  const handleChangeLabels = (event: SelectChangeEvent<typeof selectedLevels>) => {
    const {
      target: { value },
    } = event;
    setSelectedLevels(value);
  };

  // const handleChangeInstances = (event: SelectChangeEvent<typeof instances>) => {
  //   const {
  //     target: { value },
  //   } = event;
  //   setInstances(value);
  // };

  const handleStartDateChange = (newValue: MomentInput | null) => {
    setStartDateValue(newValue);
  };
  const handleEndDateChange = (newValue: MomentInput | null) => {
    setEndDateValue(newValue);
  };

  // const instancesData = useMemo(() => {
  //   const instancesArr: string[] = [];
  //   values?.forEach((item) =>
  //     item?.values?.forEach((value) => {
  //       instancesArr.push(item?.stream?.instance);
  //     })
  //   );
  //
  //   const final = instancesArr;
  //   return final;
  // }, [values]);

  const prepareData = useMemo(() => {
    const arr: Array<Array<string>> = [];
    // const instancesArr: string[] = [];
    values?.forEach((item) =>
      item?.values?.forEach((value) => {
        arr.push([...value, item?.stream?.level, item?.stream?.instance]);
        // instancesArr.push(item.stream.instance);
      })
    );
    return arr;
  }, [values]);

  const handleRefresh = useCallback(() => {
    dispatch(
      asyncGetAuthenticationQueryRange({
        query: query,
        startDate: moment(startDateValue).valueOf() * 1000000,
        endDate: moment().valueOf() * 1000000,
      })
    );
  }, [dispatch, query, startDateValue]);

  const handleGetMoreItems = useCallback(() => {
    dispatch(
      asyncGetAuthenticationQueryRange({
        query: query,
        startDate: moment(startDateValue).valueOf() * 1000000,
        endDate: moment().valueOf() * 1000000,
      })
    );
  }, [dispatch, query, startDateValue]);

  const debouncedGetApiItems = debounce(() => handleGetMoreItems(), 300);

  const loadMoreItems = async () => {
    debouncedGetApiItems();
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 8 }}>
      <Toolbar
        disableGutters
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
        <Typography sx={{ fontSize: 24, mt: 2 }}>Logs</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <IconButton aria-label="refresh" sx={{ mr: 1, mt: 2 }} onClick={() => handleRefresh()}>
            <RefreshIcon />
          </IconButton>
          {/*<FormControl sx={{ m: 1, width: 150 }}>*/}
          {/*  <InputLabel id="demo-multiple-checkbox-label">Instance</InputLabel>*/}
          {/*  <Select*/}
          {/*    sx={{ borderRadius: 3 }}*/}
          {/*    name={'Instance'}*/}
          {/*    label={'Instance'}*/}
          {/*    value={selectedInstances}*/}
          {/*    multiple*/}
          {/*    disabled={instancesData?.length === 0}*/}
          {/*    onChange={handleChangeInstances}*/}
          {/*    renderValue={(selected) => selected.join(', ')}>*/}
          {/*    {instancesData.map((item, index) => (*/}
          {/*      <MenuItem key={index} value={item}>*/}
          {/*        <Checkbox checked={selectedInstances.indexOf(item) > -1} />*/}
          {/*        <ListItemText primary={item} />*/}
          {/*      </MenuItem>*/}
          {/*    ))}*/}
          {/*  </Select>*/}
          {/*</FormControl>*/}
          <FormControl sx={{ mr: 1, width: 120, mt: 2 }}>
            <InputLabel id="demo-multiple-checkbox-label">Level</InputLabel>
            <Select
              sx={{ borderRadius: 3 }}
              name={'Level'}
              label={'Level'}
              value={selectedLevels}
              multiple
              disabled={logsLevels?.length === 0}
              onChange={handleChangeLabels}
              renderValue={(selected) => selected.join(', ')}>
              {logsLevels?.map((item, index) => (
                <MenuItem key={index} value={item}>
                  <Checkbox checked={selectedLevels?.indexOf(item) > -1} />
                  <ListItemText primary={item} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 450, mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                disableFuture={true}
                renderInput={(props) => <TextField {...props} />}
                label="Select Date"
                value={startDateValue}
                onAccept={(newValue) => {
                  handleStartDateChange(newValue);
                }}
                onChange={() => {}}
              />
            </LocalizationProvider>
            <Typography sx={{ marginX: 1 }}>to</Typography>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                maxDateTime={moment()}
                minDateTime={startDateValue}
                disableFuture={true}
                renderInput={(props) => <TextField {...props} />}
                label="Select Date"
                value={endDateValue}
                onAccept={(newValue) => {
                  handleEndDateChange(newValue);
                }}
                onChange={() => {}}
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
          flexGrow: 1,
          mt: 1,
        }}>
        {prepareData?.length ? (
          <LogsList data={prepareData} loadMoreItems={loadMoreItems} />
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
