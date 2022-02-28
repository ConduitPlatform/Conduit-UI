import { Box } from '@material-ui/core';
import React, { FC } from 'react';
import { createDocumentArray } from '../schemas/SchemaDataUtils';
import TreeElement from './TreeElement';
import { Schema } from '../../../models/database/CmsModels';
import { TreeView } from '@material-ui/lab';
import { ChevronRight, ExpandMore } from '@material-ui/icons';

type ViewOnlyTreeProps = {
  document: any;
  schema: Schema;
  expandable: string[];
  setExpandable: React.Dispatch<React.SetStateAction<string[]>>;
  editable: boolean;
  onHandleChange: (value: any, parents: any[]) => void;
  treeViewProps?: any;
  handleRelationClick: (schemaName: string, id: string, path: string[]) => void;
};

const EditDocumentTree: FC<ViewOnlyTreeProps> = ({
  setExpandable,
  expandable,
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
          expandable={expandable}
          setExpandable={setExpandable}
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
    <Box>
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

export default EditDocumentTree;
