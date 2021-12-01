import React, { FC } from 'react';
import { Box, Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { DeleteOutline, EditOutlined, KeyboardArrowDown } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { BoxProps } from '@material-ui/core/Box/Box';

const useStyles = makeStyles((theme) => ({
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

interface ExpandableArrowProps extends BoxProps {
  expandable: string[];
  handleExpandAll: () => void;
}

export const ExpandableArrow: FC<ExpandableArrowProps> = ({
  expandable,
  handleExpandAll,
  ...rest
}) => {
  const classes = useStyles();
  if (expandable.length < 1) return <></>;

  return (
    <Box {...rest}>
      <Box className={classes.buttonContainer} onClick={() => handleExpandAll()}>
        <KeyboardArrowDown />
      </Box>
    </Box>
  );
};

interface DocumentActionsProps extends BoxProps {
  handleEdit: () => void;
  handleDelete: () => void;
}

export const DocumentActions: FC<DocumentActionsProps> = ({
  handleEdit,
  handleDelete,
  ...rest
}) => {
  const classes = useStyles();
  return (
    <Box {...rest}>
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
  );
};
