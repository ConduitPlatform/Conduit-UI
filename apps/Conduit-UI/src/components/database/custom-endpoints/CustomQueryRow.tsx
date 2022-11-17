import React, { FC, useEffect, useState } from 'react';
import {
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import makeStyles from '@mui/styles/makeStyles';
import ConditionsEnum from '../../../models/ConditionsEnum';
import { isArray } from 'lodash';
import { extractInputValueType, getTypeOfValue, isValueIncompatible } from '../../../utils/cms';
import { enqueueInfoNotification } from '../../../utils/useNotifier';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  menuItem: {
    minHeight: 0,
    margin: theme.spacing(0),
    padding: theme.spacing(0),
    '&.MuiMenuItem-dense': {
      paddingLeft: 12,
      fontWeight: 'bold',
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
    },
  },
  schemaMenuItem: {
    minHeight: 0,
    margin: theme.spacing(0),
    padding: theme.spacing(0),
    '&.MuiMenuItem-dense': {
      paddingLeft: 12,
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
    },
  },

  item: {
    paddingLeft: theme.spacing(3),
  },
  schemaItem: {
    paddingLeft: theme.spacing(1),
  },
  group: {
    fontWeight: 'inherit',
    opacity: '1',
  },
  customValue: {
    fontSize: '10px',
  },
  paddingLeft: {
    paddingLeft: theme.spacing(3),
  },
}));

interface Props {
  index: number;
  query: any;
  selectedInputs: {
    array: boolean;
    location: number;
    name: string;
    optional: boolean;
    type: string;
  }[];
  editMode: boolean;
  handleQueryFieldChange: any;
  handleQueryConditionChange: any;
  handleQueryComparisonFieldChange: any;
  handleCustomValueChange: any;
  handleLikeValueChange: any;
  handleRemoveQuery: any;
}

const CustomQueryRow: FC<Props> = ({
  index,
  query,

  selectedInputs,
  editMode,
  handleQueryFieldChange,
  handleQueryConditionChange,
  handleQueryComparisonFieldChange,
  handleCustomValueChange,
  handleLikeValueChange,
  handleRemoveQuery,
}) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [schemaType, setSchemaType] = useState('');

  const { compiledSchemaFields } = useAppSelector((state) => state.customEndpointsSlice.data);

  useEffect(() => {
    if (typeof query.schemaField === 'string') {
      if (query.schemaField.indexOf('.') !== -1) {
        const splitQuery = query.schemaField.split('.');
        const foundInnerSchema = compiledSchemaFields.find(
          (field: any) => field.name === splitQuery[0]
        );
        if (foundInnerSchema.type) {
          const innerSchemaType = foundInnerSchema.type[splitQuery[1]]?.type;

          setSchemaType(innerSchemaType);
          return;
        }
        return;
      } else {
        const foundSchema = compiledSchemaFields.find(
          (schema: any) => schema.name === query.schemaField
        );
        if (foundSchema && Array.isArray(foundSchema.type)) {
          setSchemaType('Array');
        } else {
          foundSchema && setSchemaType(foundSchema.type);
        }
      }
    }
  }, [compiledSchemaFields, query.schemaField]);

  const isValueInputIncompatible = (type: any) => {
    if (isArray(type) && schemaType === 'Array') {
      return false;
    }
    if (schemaType !== type) {
      return true;
    }
  };

  const inputCustomChange = (e: React.ChangeEvent<{ value: any }>, i: number) => {
    let value = e.target.value;

    if (schemaType === 'Boolean') {
      value = value !== 'false';
    }
    if (schemaType === 'Number') {
      value = parseInt(value);
    }
    if (schemaType === 'Array') {
      dispatch(enqueueInfoNotification('Split elements with comma, without spaces', 'duplicate'));
      value = value.split(',');
    }

    handleCustomValueChange(value, i);
  };

  const isSchemaIncompatible = (isComparisonField: any, schemaName: string) => {
    if (isComparisonField) {
      return isValueIncompatible(schemaName, schemaType, compiledSchemaFields);
    }
  };

  const convertToLowerCase = (item: any) => {
    if (typeof schemaType === 'string') {
      return item.toLowerCase();
    }
  };

  const extractCustomField = () => {
    if (schemaType === 'Boolean') {
      return (
        <TextField
          size="small"
          select
          disabled={!editMode}
          label="Custom (Boolean)"
          value={query.comparisonField.value}
          fullWidth
          onChange={(event: any) => inputCustomChange(event, index)}>
          <MenuItem value="true">true</MenuItem>
          <MenuItem value="false">false</MenuItem>
        </TextField>
      );
    }
    return (
      <TextField
        size="small"
        type={query.comparisonField.type === 'Custom' ? convertToLowerCase(schemaType) : 'string'}
        label={
          <Typography className={classes.customValue}>
            {query.comparisonField.type === 'Custom'
              ? `Custom (${schemaType})`
              : 'Select from context'}
          </Typography>
        }
        variant={'outlined'}
        disabled={!editMode}
        fullWidth
        placeholder={'ex. user._id'}
        value={query.comparisonField.value}
        onChange={(event) => inputCustomChange(event, index)}
      />
    );
  };

  const getInnerSchemaName = (isComparisonField: any, item: any) => {
    const splitString = item.split('.');
    const suffix = splitString[1];
    if (!isComparisonField) {
      return suffix;
    } else {
      return `${suffix} (${getTypeOfValue(item, compiledSchemaFields)})`;
    }
  };

  const getSchemaValue = (isComparisonField: any, item: string) => {
    if (!isComparisonField) {
      return item;
    } else {
      return 'Schema-' + item;
    }
  };

  const getSecondSubField = (field: any, valuePrefix: any, suffix: any) => {
    const keys = Object?.keys(field?.type);
    const itemTop = (
      <MenuItem className={classes.menuItem} dense value={`${valuePrefix}.${suffix}`}>
        {suffix}
      </MenuItem>
    );

    const restItems = keys?.map((item, i) => {
      if (typeof field.type === 'string' || Array.isArray(field.type)) {
        return (
          <MenuItem
            className={clsx(classes.menuItem, classes.paddingLeft)}
            disabled={Array.isArray(field.type)}
            key={`ido-${i}-field`}
            value={`${valuePrefix}.${suffix}.${item}`}>
            {item}
          </MenuItem>
        );
      }
    });

    return [itemTop, ...restItems];
  };

  const getSubFields = (field: any, comparisonField?: boolean) => {
    if (field?.type) {
      const keys = Object?.keys(field?.type);

      const itemTop = (
        <MenuItem
          disabled
          dense
          className={classes.menuItem}
          value={comparisonField ? 'Schema-' + field.name : field.name}>
          {field.name}
        </MenuItem>
      );

      const restItems = keys?.map((item, i) => {
        if (
          typeof field.type?.[item]?.type === 'string' ||
          field.type?.[item]?.type instanceof String ||
          field.type?.[item]?.type === undefined ||
          Array.isArray(field.type?.[item]?.type)
        ) {
          return (
            <MenuItem
              className={clsx(classes.menuItem, classes.paddingLeft)}
              disabled={isSchemaIncompatible(comparisonField, `${field.name}.${item}`)}
              key={`idSec-${i}-field`}
              value={getSchemaValue(comparisonField, `${field.name}.${item}`)}>
              {getInnerSchemaName(comparisonField, `${field.name}.${item}`)}
            </MenuItem>
          );
        } else {
          return getSecondSubField(field.type?.[item], field.name, item);
        }
      });

      return [itemTop, ...restItems];
    }
  };

  const isOuterFieldArray = (fieldType: any) => {
    if (isArray(fieldType)) {
      return ' (Array)';
    } else {
      return ` (${fieldType})`;
    }
  };

  const prepareOptions = () => {
    return compiledSchemaFields.map((field: any, index: number) => {
      if (typeof field.type === 'string' || Array.isArray(field.type) || field.name === '_id') {
        return (
          <MenuItem
            className={classes.item}
            disabled={isSchemaIncompatible(true, `${field.name}`)}
            key={`idxO-${index}-field`}
            value={getSchemaValue(true, field.name)}>
            {field.name + isOuterFieldArray(field.type)}
          </MenuItem>
        );
      }
      return getSubFields(field, true);
    });
  };

  const prepareSchemaFieldOptions = () => {
    return compiledSchemaFields.map((field: any, index: number) => {
      if (typeof field.type === 'string' || Array.isArray(field.type) || field.name === '_id') {
        return (
          <MenuItem
            className={classes.schemaItem}
            disabled={isSchemaIncompatible(false, `${field.name}`)}
            key={`idxO-${index}-field`}
            value={getSchemaValue(false, field.name)}>
            {field.name}
          </MenuItem>
        );
      }
      return getSubFields(field, false);
    });
  };

  return (
    <>
      <Grid item container xs={12} spacing={3}>
        <Grid item xs={2} alignItems="center" justifyContent="center">
          <TextField
            select
            size="small"
            label={'Schema Field'}
            variant="outlined"
            fullWidth
            value={query.schemaField}
            disabled={!editMode}
            onChange={(event) => {
              handleQueryFieldChange(event, index);
            }}>
            <MenuItem aria-label="None" value="" />
            {prepareSchemaFieldOptions()}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField
            select
            size="small"
            label="Operator"
            variant="outlined"
            fullWidth
            value={query.operation}
            disabled={!editMode}
            onChange={(event) => handleQueryConditionChange(event, index)}>
            <MenuItem aria-label="None" value="-1" />
            <MenuItem value={ConditionsEnum.EQUAL}>(==) equal to</MenuItem>
            <MenuItem value={ConditionsEnum.NEQUAL}>(!=) not equal to</MenuItem>
            <MenuItem disabled={schemaType !== 'Number'} value={ConditionsEnum.GREATER}>
              {'(>) greater than'}
            </MenuItem>
            <MenuItem disabled={schemaType !== 'Number'} value={ConditionsEnum.GREATER_EQ}>
              {'(>=) greater that or equal to'}
            </MenuItem>
            <MenuItem disabled={schemaType !== 'Number'} value={ConditionsEnum.LESS}>
              {'(<) less than'}
            </MenuItem>
            <MenuItem disabled={schemaType !== 'Number'} value={ConditionsEnum.LESS_EQ}>
              {'(<=) less that or equal to'}
            </MenuItem>
            <MenuItem disabled={schemaType !== 'Array'} value={ConditionsEnum.EQUAL_SET}>
              (in) equal to any of the following
            </MenuItem>
            <MenuItem disabled={schemaType !== 'Array'} value={ConditionsEnum.NEQUAL_SET}>
              (not-in) not equal to any of the following
            </MenuItem>
            <MenuItem disabled={schemaType !== 'Array'} value={ConditionsEnum.CONTAIN}>
              (array-contains) an array containing
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={2}>
          <TextField
            size="small"
            select
            label={'Value'}
            variant="outlined"
            fullWidth
            value={
              query.comparisonField.type === 'Custom' || query.comparisonField.type === 'Context'
                ? query.comparisonField.type
                : query.comparisonField.type + '-' + query.comparisonField.value
            }
            disabled={!editMode}
            onChange={(event) => handleQueryComparisonFieldChange(event, index)}>
            <MenuItem aria-label="None" value="-" />
            <MenuItem disabled className={classes.group}>
              System Values
            </MenuItem>
            <MenuItem className={classes.item} value={'Context'}>
              Add a value from context
            </MenuItem>
            <MenuItem disabled className={classes.group}>
              Custom Value
            </MenuItem>
            <MenuItem className={classes.item} value={'Custom'}>
              Add a custom value
            </MenuItem>
            <MenuItem disabled className={classes.group}>
              Schema Fields
            </MenuItem>
            {prepareOptions()}
            <MenuItem disabled className={classes.group}>
              Input Fields {!selectedInputs.length && '(none available)'}
            </MenuItem>
            {selectedInputs.map((input, index) => (
              <MenuItem
                disabled={isValueInputIncompatible(input.type)}
                className={classes.item}
                key={`idxF-${index}-input`}
                value={'Input-' + input.name}>
                {`${input.name} ${extractInputValueType(input.type)}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {query.comparisonField.type === 'Custom' || query.comparisonField.type === 'Context' ? (
          <Grid item xs={2}>
            {extractCustomField()}
          </Grid>
        ) : (
          <Grid item xs={2} />
        )}
        <Grid item xs={2}>
          <FormControlLabel
            control={
              <Checkbox
                color={'primary'}
                checked={query.comparisonField.like}
                onClick={(event) => handleLikeValueChange(event, index)}
                name="Like"
                size={'small'}
                disabled={!editMode}
              />
            }
            label="Like"
          />
        </Grid>
        <Grid item xs={1}>
          <IconButton disabled={!editMode} size="small" onClick={handleRemoveQuery}>
            <RemoveCircleOutlineIcon />
          </IconButton>
        </Grid>
      </Grid>
    </>
  );
};

export default CustomQueryRow;
