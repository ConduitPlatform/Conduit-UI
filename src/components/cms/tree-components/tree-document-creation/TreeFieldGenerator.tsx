import React, { FC, memo } from 'react';
import { getFieldsArray } from '../../schema-data/SchemaDataUtils';
import { TreeView } from '@material-ui/lab';
import { Box, Typography } from '@material-ui/core';
import TreeElementByType from './TreeElementByType';
import { ChevronRight, ExpandMore } from '@material-ui/icons';

type TreeFieldGeneratorProps = {
  schema: any;
  fieldValues: any;
  onChange: (value: string, parents: string[]) => void;
};

const TreeFieldGenerator: FC<TreeFieldGeneratorProps> = ({ fieldValues, onChange, schema }) => {
  const prepareTreeItems = () => {
    const preparedFieldArray = getFieldsArray(schema.fields);
    return preparedFieldArray.map((schemaDoc: any) => (
      <TreeElementByType
        fieldValues={fieldValues}
        onChange={onChange}
        key={schemaDoc.name}
        schemaDoc={schemaDoc}
      />
    ));
  };

  return (
    <Box style={{ background: 'rgba(0,0,0,0.2)' }}>
      {schema?.fields ? (
        <TreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpanded={['root']}
          defaultExpandIcon={<ChevronRight />}>
          {prepareTreeItems()}
        </TreeView>
      ) : (
        <Typography align={'center'}>Schema unavailable!</Typography>
      )}
    </Box>
  );
};

export default memo(TreeFieldGenerator);
