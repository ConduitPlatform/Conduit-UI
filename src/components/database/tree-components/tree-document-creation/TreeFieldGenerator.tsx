import React, { FC, memo } from 'react';
import { getFieldsArray } from '../../schemas/SchemaDataUtils';
import { TreeView } from '@material-ui/lab';
import { Box, Typography } from '@material-ui/core';
import TreeElementByType from './TreeElementByType';
import { ChevronRight, ExpandMore } from '@material-ui/icons';

type TreeFieldGeneratorProps = {
  schema: any;
  fieldValues: any;
  onChange: (value: any, parents: string[]) => void;
};

const TreeFieldGenerator: FC<TreeFieldGeneratorProps> = ({ fieldValues, onChange, schema }) => {
  const prepareTreeItems = () => {
    const preparedFieldArray = getFieldsArray(schema.fields);
    const treeElements: JSX.Element[] = [];
    preparedFieldArray.forEach((schemaDoc: any) => {
      if (schemaDoc.name == 'createdAt' || schemaDoc.name == 'updatedAt' || schemaDoc.name == '_id')
        return;
      treeElements.push(
        <TreeElementByType
          fieldValues={fieldValues}
          onChange={onChange}
          key={schemaDoc.name}
          schemaDoc={schemaDoc}
        />
      );
    });
    return treeElements;
  };

  return (
    <Box>
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
