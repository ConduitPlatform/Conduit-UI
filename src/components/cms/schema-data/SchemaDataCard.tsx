import React, { FC, useEffect, useState } from 'react';
import { ChevronRight, ExpandMore } from '@material-ui/icons';
import TreeView from '@material-ui/lab/TreeView';
import Card, { CardProps } from '@material-ui/core/Card';
import TreeItem from '@material-ui/lab/TreeItem';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { CardContent } from '@material-ui/core';
import { Schema } from '../../../models/cms/CmsModels';
import getDeepValue from '../../../utils/getDeepValue';
import { asyncEditSchemaDocument, asyncGetSchemaDocument } from '../../../redux/slices/cmsSlice';
import { useAppDispatch } from '../../../redux/store';
import TreeItemLabel from './TreeItemLabel';
import {
  createDocumentArray,
  isFieldArray,
  isFieldObject,
  isFieldRelation,
} from './SchemaDataUtils';
import { DocumentActions, EditDocumentActions, ExpandableArrow } from './SchemaDataCardActions';
import { cloneDeep, set } from 'lodash';

const useStyles = makeStyles((theme) => ({
  root: {
    '& $arrow': {
      display: 'none',
    },
    '&:hover $arrow': {
      display: 'block',
    },
    '& $actionContainer': {
      display: 'none',
    },
    '&:hover $actionContainer': {
      display: 'flex',
    },
  },
  tree: {
    flexGrow: 1,
  },
  arrow: {
    position: 'absolute',
    left: theme.spacing(1),
    top: theme.spacing(2),
    transform: 'rotate(-90deg)',
  },
  arrowExpanded: {
    transform: 'rotate(0)',
  },
  actionContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(2),
    zIndex: 1,
  },
}));

interface Document {
  id: string;
  data: any;
}

interface Props extends CardProps {
  documents: any;
  onDelete: () => void;
  schema: Schema;
  getSchemaDocuments: () => void;
}

const SchemaDataCard: FC<Props> = ({
  documents,
  onDelete,
  schema,
  getSchemaDocuments,
  className,
  ...rest
}) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [expandable, setExpandable] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [edit, setEdit] = useState<boolean>(false);

  const [documentState, setDocumentState] = useState<any>(undefined);

  useEffect(() => {
    setDocumentState(documents);
  }, [documents]);

  useEffect(() => {
    setExpandable([]);
  }, [documents]);

  const handleToggle = (nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleExpandAll = () => {
    if (expandable.length !== expanded.length || expanded.length < 1) {
      setExpanded(expandable);
      return;
    }
    setExpanded([]);
  };

  const handleRelationClick = (schemaName: string, id: string, path: string[]) => {
    const params = {
      schemaName: schemaName,
      id: id,
      path: path,
      documentId: documents._id,
    };
    dispatch(asyncGetSchemaDocument(params));
  };

  const handleArrowClasses = () => {
    if (expanded.length < 1) return classes.arrow;
    return clsx(classes.arrow, classes.arrowExpanded);
  };

  const handleCardClasses = () => {
    if (expanded.length < 1) return clsx(classes.root, className);
    return className;
  };

  const onEdit = () => {
    setEdit(!edit);
  };

  const handleSave = () => {
    setEdit(false);
    const params = {
      schemaName: schema.name,
      documentId: documentState._id,
      documentData: documentState,
      getSchemaDocuments: getSchemaDocuments,
    };
    dispatch(asyncEditSchemaDocument(params));
  };

  const handleCancel = () => {
    setEdit(false);
    setDocumentState(documents);
  };

  const handleEditField = (value: any, path: any) => {
    const documentClone = cloneDeep(documentState);
    set(documentClone, path, value);
    setDocumentState(documentClone);
  };

  const renderTree = (document: Document, parents?: any) => {
    const parentsArray = parents ? [...parents, document] : [document];
    const parentArray = parentsArray.map((parent: any) => parent.id);

    const value = schema && getDeepValue(schema.fields, parentArray);

    const isArray = isFieldArray(document.data);
    const isObject = isFieldObject(document.data);
    const isRelation = isFieldRelation(value);

    if ((isArray || isObject || isRelation) && !expandable.includes(document.id)) {
      setExpandable((prevState) => [...prevState, document.id]);
    }

    return (
      <TreeItem
        key={document.id}
        nodeId={document.id}
        onClick={() => {
          if (!isRelation || typeof document.data !== 'string') return;
          handleRelationClick(value.model, document.data, parentArray);
        }}
        label={
          <TreeItemLabel
            document={document}
            isRelation={isRelation}
            edit={edit}
            onChange={(labelValue) => handleEditField(labelValue, parentArray)}
          />
        }>
        {isArray
          ? document.data.map((node: Document, index: number) =>
              renderTree({ id: index.toString(), data: node }, parentsArray)
            )
          : isObject
          ? createDocumentArray(document.data).map((node) => renderTree(node, parentsArray))
          : null}
      </TreeItem>
    );
  };

  return (
    <Card className={handleCardClasses()} variant={'outlined'} {...rest}>
      <ExpandableArrow
        className={handleArrowClasses()}
        expandable={expandable}
        handleExpandAll={handleExpandAll}
      />
      <DocumentActions
        className={classes.actionContainer}
        onEdit={onEdit}
        onDelete={onDelete}
        edit={edit}
      />
      <CardContent>
        {documentState &&
          createDocumentArray(documentState).map((document, index) => (
            <TreeView
              key={`treeView${index}`}
              className={classes.tree}
              disableSelection
              expanded={expanded}
              defaultCollapseIcon={<ExpandMore />}
              defaultExpanded={['root']}
              defaultExpandIcon={<ChevronRight />}
              onNodeToggle={(event, nodeIds) => handleToggle(nodeIds)}>
              {renderTree(document)}
            </TreeView>
          ))}
      </CardContent>
      <EditDocumentActions edit={edit} handleCancel={handleCancel} handleSave={handleSave} />
    </Card>
  );
};

export default SchemaDataCard;
