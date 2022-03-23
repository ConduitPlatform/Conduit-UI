import React from 'react';
import MomentUtils from '@date-io/moment';
import makeStyles from '@mui/styles/makeStyles';
import { Today } from '@mui/icons-material';
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
  required?: boolean;
  value: ParsableDate;
  setValue: (date: MaterialUiPickersDate) => void;
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

  const handleDateChange = (date: MaterialUiPickersDate) => {
    setValue(date);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <DatePicker
        {...rest}
        required={required}
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
