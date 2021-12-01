import React, { FC, useEffect, useState } from 'react';
import {
  KeyboardArrowDown,
  DeleteOutline,
  ChevronRight,
  ExpandMore,
  EditOutlined,
} from '@material-ui/icons';
import TreeView from '@material-ui/lab/TreeView';
import Card, { CardProps } from '@material-ui/core/Card';
import TreeItem from '@material-ui/lab/TreeItem';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Tooltip, CardContent, Box } from '@material-ui/core';
import { Schema } from '../../../models/cms/CmsModels';
import getDeepValue from '../../../utils/getDeepValue';
import { asyncGetSchemaDocument } from '../../../redux/slices/cmsSlice';
import { useAppDispatch } from '../../../redux/store';
import TreeItemLabel from './TreeItemLabel';
import { isFieldArray, isFieldObject, isFieldRelation } from './SchemaDataUtils';

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
  buttonContainer: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    background: theme.palette.grey[600],
    borderRadius: theme.spacing(0.5),
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
  actionButton: {
    height: theme.spacing(2.75),
    width: theme.spacing(2.75),
  },
}));

interface Document {
  id: string;
  data: any;
}

const createDocumentArray = (document: any) => {
  return Object.keys(document).map((key) => {
    return { id: key, data: document[key] };
  });
};

interface Props extends CardProps {
  documents: any;
  handleEdit: () => void;
  handleDelete: () => void;
  schema: Schema;
}

const SchemaDataCard: FC<Props> = ({
  documents,
  handleEdit,
  handleDelete,
  schema,
  className,
  ...rest
}) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [expandable, setExpandable] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
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
        label={<TreeItemLabel document={document} isRelation={isRelation} />}>
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
    <Card
      className={expanded.length < 1 ? clsx(classes.root, className) : className}
      variant={'outlined'}
      {...rest}>
      {expandable.length > 0 && (
        <Box
          className={
            expanded.length < 1 ? classes.arrow : clsx(classes.arrow, classes.arrowExpanded)
          }>
          <Box className={classes.buttonContainer} onClick={() => handleExpandAll()}>
            <KeyboardArrowDown />
          </Box>
        </Box>
      )}
      <Box className={classes.actionContainer}>
        <Tooltip title="Edit document">
          <Box
            className={clsx(classes.buttonContainer, classes.marginRight)}
            onClick={() => handleEdit()}>
            <EditOutlined className={classes.actionButton} />
          </Box>
        </Tooltip>
        <Tooltip title="Delete document">
          <Box className={classes.buttonContainer} onClick={() => handleDelete()}>
            <DeleteOutline className={classes.actionButton} />
          </Box>
        </Tooltip>
      </Box>
      <CardContent>
        {createDocumentArray(documents).map((document, index) => (
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
    </Card>
  );
};

export default SchemaDataCard;
