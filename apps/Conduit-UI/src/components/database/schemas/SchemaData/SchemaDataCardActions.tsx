import React, { FC } from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';
import { DeleteOutline, EditOutlined, KeyboardArrowDown } from '@mui/icons-material';
import { BoxProps } from '@mui/material/Box/Box';
import Button from '@mui/material/Button';

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
  if (edit) return <></>;
  return (
    <Box {...rest}>
      <Tooltip title="Edit document">
        <IconButton sx={{ mr: 1 }} size={'small'} onClick={onEdit} color={'secondary'}>
          <EditOutlined sx={{ height: 22, width: 22 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete document">
        <IconButton size={'small'} onClick={onDelete}>
          <DeleteOutline sx={{ height: 22, width: 22 }} color={'error'} />
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
  if (!edit) return <></>;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 2 }} {...rest}>
      <Button sx={{ marginRight: 1 }} onClick={handleCancel} variant="outlined">
        Cancel
      </Button>
      <Button color="primary" variant={'contained'} onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
};
