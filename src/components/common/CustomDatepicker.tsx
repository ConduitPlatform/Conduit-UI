import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Today } from '@mui/icons-material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { TextField } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  dateInput: {
    borderRadius: theme.spacing(0.5),
    height: theme.spacing(4),
    padding: theme.spacing(0, 1),
    fontSize: 14,
    fontWeight: 500,
    '& .MuiInputBase-input': {
      cursor: 'pointer',
    },
  },
  iconButton: {
    padding: 0,
    marginRight: 8,
    cursor: 'pointer',
  },
  datepicker: {
    margin: theme.spacing(0, 1),
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          startAdornment: <Today color={'inherit'} className={classes.iconButton} />,
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatepicker;
