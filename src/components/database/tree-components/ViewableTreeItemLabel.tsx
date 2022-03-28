import React, { FC } from 'react';
import { AccountTree } from '@mui/icons-material';
import { Typography } from '@mui/material';

interface Document {
  id: string;
  data: any;
}

interface TreeItemLabelProps {
  document: Document;
  isRelation: boolean;
}

const ViewableTreeItemLabel: FC<TreeItemLabelProps> = ({ document, isRelation }) => {
  const handleLabelContent = () => {
    const isArray = Array.isArray(document.data);
    const isObject =
      typeof document.data !== 'string' && document.data && Object.keys(document.data).length > 0;

    if (isArray) {
      if (document.data.length > 0) {
        return '[...]';
      }
      return '[ ]';
    }
    if (isObject) {
      return '{...}';
    }
    if (isRelation) {
      return <AccountTree color="primary" />;
    }
    return `${document.data}`;
  };

  return (
    <Typography
      variant={'subtitle2'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 0.25,
        minHeight: 28,
      }}>
      <Typography component={'span'} sx={{ mr: 1, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
        {`${document.id}: `}
      </Typography>
      {handleLabelContent()}
    </Typography>
  );
};

export default ViewableTreeItemLabel;
