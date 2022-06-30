import {
  Checkbox,
  FormControl,
  FormControlProps,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";
import React, { FC } from "react";

interface Props {
  values: string[];
  label: string;
  options: any[];
  handleChange: (value: any) => void;
  sortBy?: string;
  selectProps?: SelectProps;
  formControlProps?: FormControlProps;
}

const ConduitMultiSelect: FC<Props> = ({
  values,
  label,
  handleChange,
  options = [],
  sortBy,
  selectProps,
  formControlProps,
}) => {
  return (
    <FormControl {...formControlProps} variant="outlined" size="small">
      <InputLabel id="schemas">{label}</InputLabel>
      <Select
        {...selectProps}
        sx={{ borderRadius: 2 }}
        labelId={label}
        id={label}
        label={label}
        multiple
        variant="outlined"
        value={values}
        onChange={handleChange}
        renderValue={(selected: any) =>
          selected.length === 1 ? selected : "multiple"
        }
      >
        {options &&
          options.map((option: any) => (
            <MenuItem key={option} value={sortBy ? option[sortBy] : option}>
              <Checkbox
                checked={values.indexOf(sortBy ? option[sortBy] : option) > -1}
              />
              <ListItemText primary={sortBy ? option[sortBy] : option} />
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

export default ConduitMultiSelect;
