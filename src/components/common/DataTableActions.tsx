import React from 'react';
import { Box, IconButton, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import BlockIcon from '@material-ui/icons/Block';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import View from '@material-ui/icons/ViewDay';
import Upload from '@material-ui/icons/CloudUpload';
import Sync from '@material-ui/icons/Sync';
import ReplyAll from '@material-ui/icons/ReplyAll';
import ArchiveIcon from '@material-ui/icons/Archive';

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
        return <ArchiveIcon color="secondary" />;
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
                disabled={action.type === 'edit' && editDisabled}>
                {handleActions(action)}
              </IconButton>
            </Tooltip>
          );
        })}
    </Box>
  );
};

export default DataTableActions;
