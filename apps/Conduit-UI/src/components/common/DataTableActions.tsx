import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import View from '@mui/icons-material/ViewDay';
import Upload from '@mui/icons-material/CloudUpload';
import Sync from '@mui/icons-material/Sync';
import ReplyAll from '@mui/icons-material/ReplyAll';
import ArchiveIcon from '@mui/icons-material/Archive';
import { Add } from '@mui/icons-material';

interface Action {
  title: string;
  type: string;
}

interface Props {
  actions?: Action[];
  onActionClick: (action: Action) => void;
  isBlocked: boolean;
  editDisabled?: boolean;
}

const DataTableActions: React.FC<Props> = ({ actions, onActionClick, isBlocked, editDisabled }) => {
  const handleActions = (action: Action) => {
    switch (action.type) {
      case 'delete':
        return <DeleteIcon color="error" />;
      case 'edit':
        return <EditIcon color={editDisabled ? 'disabled' : 'secondary'} />;
      case 'block/unblock':
        return <BlockIcon color={isBlocked ? 'disabled' : 'error'} />;
      case 'archive':
        return <ArchiveIcon color="error" />;
      case 'enable':
        return <CheckCircleIcon color="secondary" />;
      case 'view':
        return <View color="secondary" />;
      case 'upload':
        return <Upload color="secondary" />;
      case 'sync':
        return <Sync color="secondary" />;
      case 'replies':
        return <ReplyAll color="secondary" />;
      case 'extend':
        return <Add color="secondary" />;

      default:
        return <></>;
    }
  };

  return (
    <Box display="flex" justifyContent="flex-end">
      {actions &&
        actions.map((action, index) => {
          return (
            <Tooltip title={action.title} key={index}>
              <IconButton
                key={`${action.title}${index}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onActionClick(action);
                }}
                disabled={action.type === 'edit' && editDisabled}
                size="large">
                {handleActions(action)}
              </IconButton>
            </Tooltip>
          );
        })}
    </Box>
  );
};

export default DataTableActions;
