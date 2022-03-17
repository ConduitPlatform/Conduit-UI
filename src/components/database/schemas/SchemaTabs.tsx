import { Tab, Tabs } from '@material-ui/core';
import React, { FC } from 'react';

interface Props {
  value: number;
  handleChange: any;
}

export const SchemaTabs: FC<Props> = ({ value, handleChange }) => {
  return (
    <Tabs
      style={{ width: '100%' }}
      value={value}
      onChange={handleChange}
      indicatorColor="secondary"
      variant="fullWidth"
      textColor="secondary">
      <Tab label="Overview" />
      <Tab label="Data" />
    </Tabs>
  );
};
