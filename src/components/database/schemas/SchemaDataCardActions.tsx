import React, { FC } from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';
import { DeleteOutline, EditOutlined, KeyboardArrowDown } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { BoxProps } from '@mui/material/Box/Box';
import Button from '@mui/material/Button';

const useStyles = makeStyles((theme) => ({
  marginRight: {
    marginRight: theme.spacing(1),
  },
  actionButton: {
    height: theme.spacing(2.75),
    width: theme.spacing(2.75),
  },
  editRoot: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(2),
  },
}));

interface ExpandableArrowProps extends BoxProps {
  expandable: string[];
  handleExpandAll: () => void;
  className: any;
}

export const ExpandableArrow: FC<ExpandableArrowProps> = ({
  expandable,
  handleExpandAll,
  className,
}) => {
  if (expandable.length < 1) return <></>;

  console.log(className);

  return (
    <IconButton size={'small'} onClick={handleExpandAll}>
      <KeyboardArrowDown color={'secondary'} className={className} />
    </IconButton>
  );
};

interface DocumentActionsProps extends BoxProps {
  onEdit: () => void;
  onDelete: () => void;
  edit: boolean;
}

export const DocumentActions: FC<DocumentActionsProps> = ({ onEdit, onDelete, edit, ...rest }) => {
  const classes = useStyles();
  if (edit) return <></>;
  return (
    <Box {...rest}>
      <Tooltip title="Edit document">
        <IconButton
          className={classes.marginRight}
          size={'small'}
          onClick={onEdit}
          color={'secondary'}>
          <EditOutlined className={classes.actionButton} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete document">
        <IconButton size={'small'} onClick={onDelete}>
          <DeleteOutline className={classes.actionButton} color={'error'} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

interface EditDocumentActionsProps extends BoxProps {
  handleCancel: () => void;
  handleSave: () => void;
  edit: boolean;
}

export const EditDocumentActions: FC<EditDocumentActionsProps> = ({
  handleCancel,
  handleSave,
  edit,
  ...rest
}) => {
  const classes = useStyles();
  if (!edit) return <></>;
  return (
    <Box className={classes.editRoot} {...rest}>
      <Button variant={'contained'} className={classes.marginRight} onClick={handleCancel}>
        Cancel
      </Button>
      <Button color="primary" variant={'contained'} onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
};
