import { Box } from '@material-ui/core';
import React, { FC } from 'react';
import { createDocumentArray } from '../schema-data/SchemaDataUtils';
import TreeElement from './TreeElement';
import { Schema } from '../../../models/cms/CmsModels';
import { TreeView } from '@material-ui/lab';
import { ChevronRight, ExpandMore } from '@material-ui/icons';

type ViewOnlyTreeProps = {
  document: any;
  schema: Schema;
  editable: boolean;
  onHandleChange: (value: any, parents: any[]) => void;
  treeViewProps?: any;
  handleRelationClick: (schemaName: string, id: string, path: string[]) => void;
};

const ViewOnlyTree: FC<ViewOnlyTreeProps> = ({
  onHandleChange,
  editable,
  schema,
  document,
  treeViewProps,
  handleRelationClick,
}) => {
  const renderedElements = () => {
    if (document)
      return createDocumentArray(document).map((elem) => (
        <TreeElement
          handleRelationClick={handleRelationClick}
          onHandleChange={onHandleChange}
          editable={editable}
          key={elem.id}
          schema={schema}
          document={elem}
        />
      ));
  };

  return (
    <Box style={{ background: 'rgba(0,0,0,0.2)' }}>
      <Box>
        <TreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpanded={['root']}
          defaultExpandIcon={<ChevronRight />}
          {...treeViewProps}>
          {renderedElements()}
        </TreeView>
      </Box>
    </Box>
  );
};

export default ViewOnlyTree;
