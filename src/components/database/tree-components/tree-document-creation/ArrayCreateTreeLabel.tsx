import React, { FC } from 'react';
import { Box, Button, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { AddBox } from '@mui/icons-material';
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.25, 0),
    minHeight: 28,
  },
  addButton: {
    display: 'flex',

    gap: 6,
  },
  bold: {
    marginRight: theme.spacing(1),
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  textInput: {
    fontSize: '14px',
  },
  textInputProps: {
    padding: theme.spacing(0.25, 0),
  },
  asterisk: {
    marginRight: theme.spacing(0.25),
  },
  muiSelect: {
    padding: 0,
    '& .MuiSelect-outlined': {
      padding: theme.spacing(1, 5, 1, 1),
    },
  },
}));
type ArrayCreateTreeLabel = {
  schemaDoc: any;
  onChange: (val: any) => void;
};
const ArrayCreateTreeLabel: FC<ArrayCreateTreeLabel> = ({ onChange, schemaDoc }) => {
  const classes = useStyles();
  const required = schemaDoc.data.required;

  const generateEmptyArrayOfType = (itemType: any[]): any => {
    const selectedItemType = itemType[0];
    const typeOfItem = typeof selectedItemType;
    if (typeOfItem === 'string') return '';
    if (selectedItemType?.type == 'Relation') return '';
    let generatedObject = {};
    Object.keys(selectedItemType).forEach((key) => {
      const itemArrayType = selectedItemType[key].type;
      if (Array.isArray(itemArrayType)) {
        generatedObject = { ...generatedObject, [key]: [] };
        return;
      }
      generatedObject = { ...generatedObject, [key]: '' };
      return { [key]: '' };
    });
    return generatedObject;
  };

  const handleAdd = (e: any) => {
    e.stopPropagation();
    const itemType = schemaDoc.data.type;
    const generatedArray = generateEmptyArrayOfType(itemType);
    onChange(generatedArray);
  };

  return (
    <Box className={classes.root}>
      {required && (
        <Typography component="span" variant="body2" className={classes.asterisk}>
          {'*'}
        </Typography>
      )}
      <Typography component="span" className={classes.bold}>
        {schemaDoc.name}:
      </Typography>
      <Button onClick={handleAdd} size={'small'}>
        <Box className={classes.addButton}>
          <Typography component="span">Add element</Typography>
          <AddBox />
        </Box>
      </Button>
    </Box>
  );
};

export default ArrayCreateTreeLabel;
