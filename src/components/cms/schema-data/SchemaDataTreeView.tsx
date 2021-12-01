import React, { FC } from 'react';
import { ChevronRight, ExpandMore } from '@material-ui/icons';
import TreeView from '@material-ui/lab/TreeView';
import { makeStyles } from '@material-ui/core/styles';
import { SingleSelectTreeViewProps, TreeViewProps } from '@material-ui/lab/TreeView/TreeView';

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

interface Props extends SingleSelectTreeViewProps {
  expanded: any;
}

const SchemaDataTreeView: FC<Props> = ({ expanded, ...rest }) => {
  const classes = useStyles();

  return (
    <TreeView
      className={classes.tree}
      disableSelection
      expanded={expanded}
      defaultCollapseIcon={<ExpandMore />}
      defaultExpanded={['root']}
      defaultExpandIcon={<ChevronRight />}
      // onNodeToggle={(event, nodeIds) => handleToggle(nodeIds)}
    >
      {/*{renderTree(document)}*/}
    </TreeView>
  );
};
