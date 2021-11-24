import React, { FC, useState } from 'react';
import Box from '@material-ui/core/Box';
import { KeyboardArrowDown } from '@material-ui/icons';
import CardContent from '@material-ui/core/CardContent';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Card, { CardProps } from '@material-ui/core/Card';
import TreeItem from '@material-ui/lab/TreeItem';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  tree: {
    flexGrow: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  arrow: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    background: theme.palette.grey[600],
    position: 'absolute',
    left: theme.spacing(1),
    top: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    transform: 'rotate(-90deg)',
    cursor: 'pointer',
  },
  arrowExpanded: {
    transform: 'rotate(0)',
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
}

const SchemaDataCard: FC<Props> = ({ documents, ...rest }) => {
  const classes = useStyles();

  const [expandable, setExpandable] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

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
    const isArray = Array.isArray(document.data);
    const isObject = typeof document.data !== 'string' && Object.keys(document.data).length > 0;

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
    <Card variant={'outlined'} {...rest}>
      <Box
        className={expanded.length < 1 ? classes.arrow : clsx(classes.arrow, classes.arrowExpanded)}
        onClick={() => handleExpandAll()}>
        <KeyboardArrowDown />
      </Box>
      <CardContent>
        {createDocumentArray(documents).map((document, index) => {
          return (
            <TreeView
              key={`treeView${index}`}
              className={classes.tree}
              disableSelection
              expanded={expanded}
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpanded={['root']}
              defaultExpandIcon={<ChevronRightIcon />}
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
