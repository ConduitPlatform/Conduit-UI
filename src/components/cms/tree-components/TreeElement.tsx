import React, { FC, memo } from 'react';
import { createDocumentArray, isFieldArray, isFieldObject } from '../schema-data/SchemaDataUtils';
import { Schema } from '../../../models/cms/CmsModels';
import { TreeItem } from '@material-ui/lab';

type TreeElementProps = {
  document: any;
  schema: Schema;
  expandAll?: boolean;
};

const TreeElement: FC<TreeElementProps> = ({ schema, document, expandAll }) => {
  const isArray = isFieldArray(document.data);
  const isObject = isFieldObject(document.data);

  const renderWrappedElements = () => {
    const itemDescription = isArray ? '[...]' : isObject ? '{...}' : 'objectID';
    let preparedDocs = null;
    if (isArray) {
      preparedDocs = document.data.map((node: Document, index: number) => ({
        id: index.toString(),
        data: node,
      }));
    } else {
      if (isObject) {
        preparedDocs = createDocumentArray(document.data);
      }
    }
    return (
      <TreeItem key={document.id} nodeId={document.id} label={`${document.id} ${itemDescription}`}>
        {preparedDocs?.map((elem: any) => (
          <TreeElement schema={schema} document={elem} expandAll={false} />
        ))}
      </TreeItem>
    );
  };

  return !isObject && !isArray ? (
    <TreeItem key={document.id} nodeId={document.id} label={`${document.id}:${document.data}`} />
  ) : (
    renderWrappedElements()
  );
};

export default memo(TreeElement);
