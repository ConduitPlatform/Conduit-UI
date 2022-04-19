import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Today } from '@mui/icons-material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterMoment from '@mui/lab/AdapterMoment';
import { TextField } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  dateInput: {
    borderRadius: 2,
    height: 40,
    padding: 1,
    fontSize: 14,
    fontWeight: 500,
    '& .MuiInputBase-input': {
      cursor: 'pointer',
    },
  },
  datepicker: {
    margin: 1,
  },
}));

interface Props {
  required?: boolean;
  value: string | undefined;
  setValue: (date: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomDatepicker: React.FC<Props> = ({
  required = false,
  disabled = false,
  value,
  setValue,
  placeholder,
  ...rest
}) => {
  const classes = useStyles();

  const handleDateChange = (date: any) => {
    setValue(date);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        {...rest}
        disabled={disabled}
        className={classes.datepicker}
        inputFormat="dd-MM-yyyy"
        value={value ? value : null}
        onChange={handleDateChange}
        renderInput={(params) => <TextField {...params} />}
        InputProps={{
          disableUnderline: true,
          className: classes.dateInput,
          startAdornment: (
            <Today color={'inherit'} sx={{ padding: 0, marginRight: 8, cursor: 'pointer' }} />
          ),
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatepicker;
