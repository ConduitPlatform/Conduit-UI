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
import { Typography, Tooltip, CardContent, Box } from '@material-ui/core';

const buttonDimensions = 18;

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
  bold: {
    fontWeight: 'bold',
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
    height: buttonDimensions,
    width: buttonDimensions,
  },
}));

interface Document {
  id: string;
  data: any;
}

interface TreeItemLabelProps {
  document: Document;
}

const TreeItemLabel: FC<TreeItemLabelProps> = ({ document }) => {
  const classes = useStyles();
  return (
    <Typography variant={'subtitle2'}>
      <Typography component={'span'} className={classes.bold}>{`${document.id}: `}</Typography>
      {Array.isArray(document.data)
        ? document.data.length > 0
          ? '[...]'
          : '[ ]'
        : typeof document.data !== 'string' &&
          document.data &&
          Object.keys(document.data).length > 0
        ? '{...}'
        : `${document.data}`}
    </Typography>
  );
};

const createDocumentArray = (document: any) => {
  return Object.keys(document).map((key) => {
    return { id: key, data: document[key] };
  });
};

interface Props extends CardProps {
  documents: any;
  handleEdit: () => void;
  handleDelete: () => void;
}

const SchemaDataCard: FC<Props> = ({ documents, handleEdit, handleDelete, className, ...rest }) => {
  const classes = useStyles();

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

  const renderTree = (document: Document) => {
    const isArray = document.data && Array.isArray(document.data);
    const isObject =
      document.data && typeof document.data !== 'string' && Object.keys(document.data).length > 0;

    if ((isArray || isObject) && !expandable.includes(document.id)) {
      setExpandable((prevState) => [...prevState, document.id]);
    }
    return (
      <TreeItem
        key={document.id}
        nodeId={document.id}
        label={<TreeItemLabel document={document} />}>
        {isArray
          ? document.data.map((node: Document, index: number) =>
              renderTree({ id: index.toString(), data: node })
            )
          : isObject
          ? createDocumentArray(document.data).map((node) => renderTree(node))
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
        {createDocumentArray(documents).map((document, index) => {
          return (
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
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SchemaDataCard;
