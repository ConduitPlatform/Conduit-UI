import React, { FC } from 'react';
import { Box, Button, Grid, useTheme } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

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
  const theme = useTheme();
  const handleChange = () => {
    if (operator === 'AND') handleOperatorChange('OR');
    if (operator === 'OR') handleOperatorChange('AND');
  };

  return (
    <Box width={'100%'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
      <Box display="flex" width="100%" justifyContent={'space-between'}>
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
            sx={{
              '&.Mui-selected': {
                '&&': { backgroundColor: theme.palette.primary.main, color: '#262840' },
              },
              '&.MuiToggleButton-root': { width: '52px', height: '35px', fontWeight: 'bold' },
            }}>
            AND
          </ToggleButton>
          <ToggleButton
            disabled={!editMode}
            value="OR"
            aria-label="centered"
            sx={{
              '&.Mui-selected': {
                '&&': { backgroundColor: theme.palette.primary.main, color: '#262840' },
              },
              '&.MuiToggleButton-root': { width: '52px', height: '35px', fontWeight: 'bold' },
            }}>
            OR
          </ToggleButton>
        </ToggleButtonGroup>
        <Box display="flex">
          <Button
            variant="text"
            color={'primary'}
            startIcon={<AddCircleOutline />}
            disabled={!editMode}
            onClick={handleAddNode}>
            Query
          </Button>
          <Button
            variant="text"
            color={'primary'}
            startIcon={<RemoveCircleOutline />}
            disabled={!editMode}
            onClick={handleRemoveNode}>
            Query
          </Button>

          <Button
            variant="text"
            color={'primary'}
            startIcon={<AddCircleOutline />}
            disabled={!editMode}
            onClick={handleAddQuery}>
            Condition
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TreeItemContent;
