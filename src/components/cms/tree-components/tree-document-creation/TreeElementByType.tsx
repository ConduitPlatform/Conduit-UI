import React, { FC } from 'react';
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
  // console.log(fieldValues);
  console.log(fieldValues);

  const onAddArrayElement = (newArray: string) => {
    const selectedValue = getDeepValue(fieldValues, parents ? parents : []);
    const prevValue = selectedValue?.[schemaDoc?.name] ?? [];
    const mergedArray = prevValue?.concat(newArray);
    onChange(mergedArray, parentsArray);
  };

  const generateNewTreeElements = () => {
    if (isArray) {
      const value = getDeepValue(fieldValues, parents ? parents : []);
      const inputValue = value && value[schemaDoc.name] ? value[schemaDoc.name] : '';
      const hasItems = inputValue?.length > 0;
      return (
        <TreeItem
          nodeId={schemaDoc.name}
          label={<ArrayCreateTreeLabel onChange={onAddArrayElement} schemaDoc={schemaDoc} />}>
          {/*{hasItems &&*/}
          {/*  inputValue?.map((items: any, index: number) => {*/}
          {/*    return (*/}
          {/*      <TreeItem*/}
          {/*        nodeId={schemaDoc.name + index.toString()}*/}
          {/*        key={index}*/}
          {/*        label={`${index}:`}>*/}
          {/*        {Object.keys(schemaDoc.data.type[0]).map((node) => {*/}
          {/*          const newSchemaDoc = { name: node, data: schemaDoc.data.type[0][node] };*/}
          {/*          return (*/}
          {/*            <TreeElementByType*/}
          {/*              fieldValues={fieldValues}*/}
          {/*              onChange={onChange}*/}
          {/*              key={schemaDoc.name}*/}
          {/*              schemaDoc={newSchemaDoc}*/}
          {/*              parents={parentsArray}*/}
          {/*            />*/}
          {/*          );*/}
          {/*        })}*/}
          {/*      </TreeItem>*/}
          {/*    );*/}
          {/*  })}*/}
        </TreeItem>
      );
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

export default TreeElementByType;
