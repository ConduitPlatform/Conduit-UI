import { Box } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { createDocumentArray } from '../schema-data/SchemaDataUtils';
import TreeElement from './TreeElement';
import { Schema } from '../../../models/cms/CmsModels';
import { TreeView } from '@material-ui/lab';
import { ChevronRight, ExpandMore } from '@material-ui/icons';

type ViewOnlyTreeProps = {
  document: any;
  expandAll?: boolean;
  schema: Schema;
};

const ViewOnlyTree: FC<ViewOnlyTreeProps> = ({ schema, document, expandAll }) => {
  const renderedElements = useMemo(() => {
    if (document)
      return createDocumentArray(document).map((elem) => (
        <TreeElement key={elem.id} schema={schema} document={elem} expandAll={false} />
      ));
  }, [document]);

  return (
    <Box style={{ background: 'rgba(0,0,0,0.2)' }}>
      <Box>
        <TreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpanded={['root']}
          defaultExpandIcon={<ChevronRight />}>
          {renderedElements}
        </TreeView>
      </Box>
    </Box>
  );
};

export default ViewOnlyTree;
