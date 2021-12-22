import React, { FC } from 'react';
import { Box, Button, Grid } from '@material-ui/core';
import { AddCircleOutline, RemoveCircleOutline } from '@material-ui/icons';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  selected: {
    '&&': {
      backgroundColor: '#07D9C4',
      color: '#262840',
    },
  },
  button: {
    width: '52px',
    height: '35px',
    fontWeight: 'bold',
  },
}));

interface Props {
  operator: any;
  editMode: boolean;
  handleOperatorChange: any;
  handleAddNode: any;
  handleRemoveNode: any;
  handleAddQuery: any;
}

const TreeItemContent: FC<Props> = ({
  operator,
  editMode,
  handleOperatorChange,
  handleAddNode,
  handleRemoveNode,
  handleAddQuery,
}) => {
  const classes = useStyles();
  const handleChange = () => {
    if (operator === 'AND') handleOperatorChange('OR');
    if (operator === 'OR') handleOperatorChange('AND');
  };

  return (
    <Box width={'100%'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
      <Grid container justifyContent={'space-between'}>
        <Grid container item xs={7} spacing={1}>
          <Grid container item alignItems={'center'}>
            <ToggleButtonGroup
              size="small"
              value={operator}
              exclusive
              onChange={handleChange}
              aria-label="text alignment">
              <ToggleButton
                disabled={!editMode}
                value="AND"
                aria-label="left aligned"
                color="primary"
                classes={{ selected: classes.selected, root: classes.button }}>
                AND
              </ToggleButton>
              <ToggleButton
                disabled={!editMode}
                value="OR"
                aria-label="centered"
                classes={{ selected: classes.selected, root: classes.button }}>
                OR
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        <Grid container item xs={5} justifyContent={'flex-end'} spacing={1}>
          <Grid item>
            <Button
              variant="text"
              color={'secondary'}
              startIcon={<AddCircleOutline />}
              disabled={!editMode}
              onClick={handleAddNode}>
              Query
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="text"
              color={'secondary'}
              startIcon={<RemoveCircleOutline />}
              disabled={!editMode}
              onClick={handleRemoveNode}>
              Query
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="text"
              color={'secondary'}
              startIcon={<AddCircleOutline />}
              disabled={!editMode}
              onClick={handleAddQuery}>
              Condition
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TreeItemContent;
