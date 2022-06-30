import React, { FC, useEffect, useState } from 'react';
import Card, { CardProps } from '@mui/material/Card';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { CardContent } from '@mui/material';
import { Schema } from '../../../../models/database/CmsModels';
import {
  asyncEditSchemaDocument,
  asyncGetSchemaDocument,
} from '../../../../redux/slices/databaseSlice';
import { useAppDispatch } from '../../../../redux/store';
import { DocumentActions, EditDocumentActions, ExpandableArrow } from './SchemaDataCardActions';
import { cloneDeep, set } from 'lodash';
import EditDocumentTree from '../../tree-components/EditDocumentTree';
import TreeFieldGenerator from '../../tree-components/tree-document-creation/TreeFieldGenerator';

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
  rootEditable: {
    borderColor: theme.palette.primary.main,
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
    let cardClasses = className;
    if (expanded.length < 1) {
      cardClasses = clsx(classes.root, cardClasses);
    }
    if (edit) {
      cardClasses = clsx(classes.rootEditable, cardClasses);
    }
    return cardClasses;
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
      onEditError: () => setDocumentState(documents),
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
        {edit ? (
          <TreeFieldGenerator
            schema={schema}
            onChange={handleEditField}
            fieldValues={documentState}
          />
        ) : (
          <EditDocumentTree
            treeViewProps={{
              expanded: expanded,
              onNodeToggle: (event: any, nodeIds: any[]) => handleToggle(nodeIds),
            }}
            expandable={expandable}
            setExpandable={setExpandable}
            onHandleChange={handleEditField}
            editable={edit}
            document={documentState}
            schema={schema}
            handleRelationClick={handleRelationClick}
          />
        )}
      </CardContent>
      <EditDocumentActions edit={edit} handleCancel={handleCancel} handleSave={handleSave} />
    </Card>
  );
};

export default SchemaDataCard;
