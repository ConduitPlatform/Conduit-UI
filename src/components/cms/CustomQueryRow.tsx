import React, { FC, useEffect, useState } from 'react';
import {
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import { makeStyles } from '@material-ui/core/styles';
import ConditionsEnum from '../../models/ConditionsEnum';
import { isArray } from 'lodash';
import { extractInputValueType, getTypeOfValue, isValueIncompatible } from '../../utils/cms';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import { useAppDispatch } from '../../redux/store';

const useStyles = makeStyles((theme) => ({
  menuItem: {
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
  alignment: {
    marginBottom: theme.spacing(1),
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
}));

interface Props {
  index: number;
  query: any;
  availableFieldsOfSchema: any;
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
  availableFieldsOfSchema,
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

  useEffect(() => {
    if (query.schemaField) {
      if (query.schemaField.indexOf('.') !== -1) {
        const splitQuery = query.schemaField.split('.');
        const foundInnerSchema = availableFieldsOfSchema.find(
          (field: any) => field.name === splitQuery[0]
        );
        if (foundInnerSchema.type) {
          const innerSchemaType = foundInnerSchema.type[splitQuery[1]]?.type;

          setSchemaType(innerSchemaType);
          return;
        }
        return;
      } else {
        const foundSchema = availableFieldsOfSchema.find(
          (schema: any) => schema.name === query.schemaField
        );
        if (foundSchema && Array.isArray(foundSchema.type)) {
          setSchemaType('Array');
        } else {
          foundSchema && setSchemaType(foundSchema.type);
        }
      }
    }
  }, [availableFieldsOfSchema, query.schemaField]);

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

  console.log(query);

  const isSchemaIncompatible = (isComparisonField: any, schemaName: string) => {
    if (!isComparisonField) {
      return false;
    } else {
      return isValueIncompatible(schemaName, schemaType, availableFieldsOfSchema);
    }
  };

  const extractCustomField = () => {
    if (schemaType === 'Boolean') {
      return (
        <Select
          disabled={!editMode}
          value={query.comparisonField.value}
          native
          fullWidth
          onChange={(event) => inputCustomChange(event, index)}>
          <option />
          <option value="true">true</option>
          <option value="false">false</option>
        </Select>
      );
    } else {
      return (
        <TextField
          type={query.comparisonField.type === 'Custom' ? schemaType?.toLowerCase() : 'string'}
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
    }
  };

  const getInnerSchemaName = (isComparisonField: any, item: any) => {
    const splitString = item.split('.');
    const suffix = splitString[1];
    if (!isComparisonField) {
      return suffix;
    } else {
      return `${suffix} (${getTypeOfValue(item, availableFieldsOfSchema)})`;
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
      <MenuItem
        className={classes.menuItem}
        dense
        style={{
          fontWeight: 'bold',
          paddingLeft: 8,
          background: 'rgba(0, 0, 0, 0.05)',
        }}
        value={`${valuePrefix}.${suffix}`}>
        {suffix}
      </MenuItem>
    );

    const restItems = keys?.map((item, i) => {
      if (typeof field.type === 'string' || Array.isArray(field.type)) {
        return (
          <MenuItem
            className={classes.menuItem}
            disabled={Array.isArray(field.type)}
            style={{
              paddingLeft: 24,
            }}
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
          style={{
            fontWeight: 'bold',
          }}
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
              className={classes.menuItem}
              disabled={isSchemaIncompatible(comparisonField, `${field.name}.${item}`)}
              style={{
                paddingLeft: 24,
              }}
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

  const prepareOptions = (comparisonField?: boolean) => {
    return availableFieldsOfSchema.map((field: any, index: number) => {
      if (typeof field.type === 'string' || Array.isArray(field.type)) {
        return (
          <MenuItem
            className={comparisonField ? classes.item : classes.schemaItem}
            disabled={isSchemaIncompatible(comparisonField, `${field.name}`)}
            key={`idxO-${index}-field`}
            value={getSchemaValue(comparisonField, field.name)}>
            {comparisonField ? field.name + isOuterFieldArray(field.type) : field.name}
          </MenuItem>
        );
      }
      return getSubFields(field, comparisonField);
    });
  };
  console.log(query);
  return (
    <>
      <Grid item xs={2}>
        <TextField
          select
          label={'Schema Field'}
          variant="outlined"
          fullWidth
          value={query.schemaField}
          disabled={!editMode}
          onChange={(event) => {
            handleQueryFieldChange(event, index);
          }}>
          <MenuItem aria-label="None" value="" />
          {prepareOptions()}
        </TextField>
      </Grid>
      <Grid item xs={3}>
        <TextField
          select
          label="Operator"
          variant="outlined"
          fullWidth
          value={query.operation}
          disabled={!editMode}
          onChange={(event) => handleQueryConditionChange(event, index)}>
          <MenuItem aria-label="None" value="" />
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
          <MenuItem aria-label="None" value="" />
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
          {prepareOptions(true)}
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
      <Grid item className={classes.alignment} xs={2}>
        <FormControlLabel
          control={
            <Checkbox
              color={'primary'}
              checked={query.comparisonField.like}
              onChange={(event) => handleLikeValueChange(event, index)}
              name="Like"
              size={'small'}
              disabled={!editMode}
            />
          }
          label="Like"
        />
      </Grid>
      <Grid item className={classes.alignment} xs={1}>
        <IconButton disabled={!editMode} size="small" onClick={handleRemoveQuery}>
          <RemoveCircleOutlineIcon />
        </IconButton>
      </Grid>
    </>
  );
};

export default CustomQueryRow;
