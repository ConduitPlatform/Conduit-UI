import React, { FC, memo, useState } from 'react';
import { getFieldsArray } from '../../schema-data/SchemaDataUtils';
import { TreeView } from '@material-ui/lab';
import { Box, Typography } from '@material-ui/core';
import TreeElementByType from './TreeElementByType';
import { cloneDeep, set } from 'lodash';
import { ChevronRight, ExpandMore } from '@material-ui/icons';

type TreeFieldGeneratorProps = {
  schema: any;
};

const TreeFieldGenerator: FC<TreeFieldGeneratorProps> = ({ schema }) => {
  const [fieldValues, setFieldValues] = useState<any>({});
  const onChange = (value: string, parents: string[]) => {
    const fieldValuesClone = cloneDeep(fieldValues);
    const fieldValuesCloneSet = set(fieldValuesClone, parents, value);
    setFieldValues(fieldValuesCloneSet);
  };
  // console.log(fieldValues);
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
