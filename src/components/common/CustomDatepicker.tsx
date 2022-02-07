import React from 'react';
import MomentUtils from '@date-io/moment';
import { makeStyles } from '@material-ui/core/styles';
import { Today } from '@material-ui/icons';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { ParsableDate } from '@material-ui/pickers/constants/prop-types';

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
  value: ParsableDate;
  setValue: (date: MaterialUiPickersDate) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomDatepicker: React.FC<Props> = ({
  disabled = false,
  value,
  setValue,
  placeholder,
  ...rest
}) => {
  const classes = useStyles();

  const handleDateChange = (date: MaterialUiPickersDate) => {
    setValue(date);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <DatePicker
        {...rest}
        disabled={disabled}
        className={classes.datepicker}
        autoOk
        variant="inline"
        format="DD/MM/YYYY"
        value={value ? value : null}
        onChange={handleDateChange}
        placeholder={placeholder}
        invalidDateMessage={''}
        emptyLabel={' -- / -- / ---- '}
        InputProps={{
          disableUnderline: true,
          className: classes.dateInput,
          startAdornment: <Today color={'inherit'} className={classes.iconButton} />,
        }}
      />
    </MuiPickersUtilsProvider>
  );
};

export default CustomDatepicker;
