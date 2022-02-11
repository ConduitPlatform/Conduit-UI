import React, { FC, memo } from 'react';
import { TreeItem } from '@material-ui/lab';
import InputCreateTreeLabel from './InputCreateTreeLabel';
import getDeepValue from '../../../../utils/getDeepValue';
import ArrayCreateTreeLabel from './ArrayCreateTreeLabel';

type TreeElementByTypeProps = {
  schemaDoc: any;
  parents?: any[];
  fieldValues: any;
  onChange: (value: string, parents: string[]) => void;
};
const TreeElementByType: FC<TreeElementByTypeProps> = ({
  fieldValues,
  schemaDoc,
  onChange,
  parents,
}) => {
  const parentsArray = parents ? [...parents, schemaDoc.name] : [schemaDoc.name];
  const isArray = schemaDoc?.data?.type && Array.isArray(schemaDoc.data.type);
  const isObject = schemaDoc?.data?.type && typeof schemaDoc.data.type !== 'string' && !isArray;

  const onAddArrayElement = (newArray: string) => {
    const selectedValue = getDeepValue(fieldValues, parents ? parents : []);
    const prevValue = selectedValue?.[schemaDoc?.name] ?? [];
    const mergedArray = prevValue?.concat(newArray);
    onChange(mergedArray, parentsArray);
  };

  const generateArrayTreeElements = () => {
    const value = getDeepValue(fieldValues, parents ? parents : []);
    const inputValue = value && value[schemaDoc.name] ? value[schemaDoc.name] : '';
    const hasItems = inputValue?.length > 0;
    let subArrayItems: any = undefined;
    if (hasItems) {
      subArrayItems = inputValue?.map((itemValues: any, index: number) => {
        if (typeof schemaDoc.data.type[0] === 'string') {
          const newSchemaDoc = { name: index.toString(), data: { type: schemaDoc.data.type[0] } };
          return (
            <TreeElementByType
              fieldValues={fieldValues}
              onChange={onChange}
              key={schemaDoc.name}
              schemaDoc={newSchemaDoc}
              parents={parentsArray}
            />
          );
        }

        return Object.keys(schemaDoc.data.type).map(() => {
          const newSchemaDoc = { name: index.toString(), data: { type: schemaDoc.data.type[0] } };
          return (
            <TreeElementByType
              fieldValues={fieldValues}
              onChange={onChange}
              key={schemaDoc.name}
              schemaDoc={newSchemaDoc}
              parents={parentsArray}
            />
          );
        });
      });
    }
    return (
      <TreeItem
        nodeId={schemaDoc.name}
        label={<ArrayCreateTreeLabel onChange={onAddArrayElement} schemaDoc={schemaDoc} />}>
        {subArrayItems}
      </TreeItem>
    );
  };

  const generateNewTreeElements = () => {
    if (isArray) {
      return generateArrayTreeElements();
    }
    return (
      <TreeItem nodeId={schemaDoc.name} label={`${schemaDoc.name}:`}>
        {Object.keys(schemaDoc.data.type).map((node) => {
          const newSchemaDoc = { name: node, data: schemaDoc.data.type[node] };
          return (
            <TreeElementByType
              fieldValues={fieldValues}
              onChange={onChange}
              key={schemaDoc.name}
              schemaDoc={newSchemaDoc}
              parents={parentsArray}
            />
          );
        })}
      </TreeItem>
    );
  };

  const createInputTree = () => {
    const value = getDeepValue(fieldValues, parents ? parents : []);
    const inputValue = value && value[schemaDoc.name] ? value[schemaDoc.name] : '';
    return (
      <TreeItem
        nodeId={'eye'}
        label={
          <InputCreateTreeLabel
            value={inputValue}
            schemaDoc={schemaDoc}
            onChange={(val) => onChange(val, parentsArray)}
          />
        }
      />
    );
  };

  return <>{!isArray && !isObject ? createInputTree() : generateNewTreeElements()}</>;
};

export default memo(TreeElementByType);
