import React, { FC, memo, useEffect } from 'react';
import {
  createDocumentArray,
  isFieldArray,
  isFieldObject,
  isFieldRelation,
} from '../schemas/SchemaData/SchemaDataUtils';
import { Schema } from '../../models/CmsModels';
import { TreeItem } from '@mui/lab';
import getDeepValue from '../../../../utils/getDeepValue';
import ViewableTreeItemLabel from './ViewableTreeItemLabel';
import EditableTreeItemLabel from './EditableTreeItemLabel';

type TreeElementProps = {
  document: any;
  schema: Schema;
  editable: boolean;
  parents?: any[];
  onHandleChange: (value: any, parents: any[]) => void;
  handleRelationClick: (schemaName: string, id: string, path: string[]) => void;
  expandable: string[];
  setExpandable: React.Dispatch<React.SetStateAction<string[]>>;
};

const TreeElement: FC<TreeElementProps> = ({
  expandable,
  setExpandable,
  handleRelationClick,
  onHandleChange,
  editable,
  schema,
  document,
  parents,
}) => {
  const parentsArray = parents ? [...parents, document] : [document];
  const parentArray = parentsArray.map((parent: any) => parent.id);
  const typeValue = schema ? getDeepValue(schema.fields, parentArray) : undefined;

  const isArray = isFieldArray(document.data);
  const isObject = isFieldObject(document.data);
  const isRelation = isFieldRelation(typeValue);

  const docField: any = document.id;
  const itemType = schema?.fields?.[docField] ?? '';

  useEffect(() => {
    if ((isArray || isObject || isRelation) && !expandable.includes(document.id)) {
      setExpandable((prevState) => [...prevState, document.id]);
    }
  }, [document]);

  const renderWrappedElements = () => {
    let preparedDocs = null;
    if (isArray) {
      preparedDocs = document.data.map((node: Document, index: number) => ({
        id: index.toString(),
        data: node,
      }));
    }
    if (isObject) {
      preparedDocs = createDocumentArray(document.data);
    }

    return (
      <TreeItem
        key={document.id}
        nodeId={document.id}
        label={<ViewableTreeItemLabel document={document} isRelation={isRelation} />}>
        {preparedDocs?.map((elem: any, i: number) => (
          <TreeElement
            expandable={expandable}
            setExpandable={setExpandable}
            handleRelationClick={handleRelationClick}
            onHandleChange={onHandleChange}
            key={document.id + i}
            editable={editable}
            schema={schema}
            document={elem}
            parents={parentsArray}
          />
        ))}
      </TreeItem>
    );
  };

  const renderTreeValue = () => {
    const label = editable ? (
      <EditableTreeItemLabel
        document={document}
        field={itemType}
        onChange={(e) => onHandleChange(e, parentArray)}
      />
    ) : (
      <ViewableTreeItemLabel document={document} isRelation={isRelation} />
    );
    return (
      <TreeItem
        onClick={() => {
          if (!isRelation || typeof document.data !== 'string') return;
          handleRelationClick(typeValue.model, document.data, parentArray);
        }}
        key={document.id}
        nodeId={document.id}
        label={label}
      />
    );
  };

  return !isObject && !isArray ? renderTreeValue() : renderWrappedElements();
};

export default memo(TreeElement);
