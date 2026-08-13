import React, { FC } from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { AccountTree, DataObject } from '@mui/icons-material';
import { SchemaDataViewMode } from './schemaDataViewMode';

interface Props {
  viewMode: SchemaDataViewMode;
  onChange: (mode: SchemaDataViewMode) => void;
  disabled?: boolean;
}

const SchemaDataViewToggle: FC<Props> = ({ viewMode, onChange, disabled = false }) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: SchemaDataViewMode | null
  ) => {
    if (value === null) return;
    onChange(value);
  };

  return (
    <ToggleButtonGroup
      size="small"
      value={viewMode}
      exclusive
      disabled={disabled}
      onChange={handleChange}
      aria-label="Document view mode">
      <ToggleButton value="tree" aria-label="Tree view">
        <Tooltip title="Tree view">
          <AccountTree fontSize="small" sx={{ mr: 0.5 }} />
        </Tooltip>
        Tree
      </ToggleButton>
      <ToggleButton value="json" aria-label="JSON view">
        <Tooltip title="JSON view">
          <DataObject fontSize="small" sx={{ mr: 0.5 }} />
        </Tooltip>
        JSON
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default SchemaDataViewToggle;
