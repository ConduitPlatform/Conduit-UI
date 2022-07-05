import React, { useState } from 'react';
import { List, ListItemIcon, ListItemText, ListItem, Collapse, Tooltip } from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import PeopleIcon from '@mui/icons-material/People';
import EditAttributesIcon from '@mui/icons-material/EditAttributes';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import TocIcon from '@mui/icons-material/Toc';
import PersonIcon from '@mui/icons-material/Person';
import { Schema } from '../models/database/CmsModels';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

export const ExtractSchemaInfo = (schema: Schema, introspection?: boolean) => {
  const permissions = schema?.modelOptions?.conduit?.permissions;
  const cms = schema?.modelOptions?.conduit?.cms;
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List component="nav" aria-label="main mailbox folders">
      {cms && (
        <>
          <ListItem button onClick={handleClick}>
            <ListItemIcon>
              <TocIcon />
            </ListItemIcon>
            <ListItemText primary="CMS" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem sx={{ pl: 3 }}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
              </ListItem>
              <ListItem sx={{ pl: 3 }}>
                <ListItemIcon>
                  <EditAttributesIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Crud operations"
                  secondary={cms.crudOperations ? 'Enabled' : 'Disabled'}
                />
              </ListItem>
              <ListItem sx={{ pl: 3 }}>
                <ListItemIcon>
                  <DoneAllIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Schema is enabled"
                  secondary={cms.crudOperations ? 'True' : 'False'}
                />
              </ListItem>
            </List>
          </Collapse>
        </>
      )}
      {schema?.extensions?.length > 0 && (
        <ListItem>
          <ListItemIcon>
            <ExtensionIcon />
          </ListItemIcon>
          <ListItemText primary="Schema has extensions" />
        </ListItem>
      )}
      {permissions?.extendable && (
        <ListItem>
          <ListItemIcon>
            <ExtensionIcon />
          </ListItemIcon>
          <Tooltip title="Allows the schema to be extended by modules">
            <ListItemText primary="Extendable" />
          </Tooltip>
        </ListItem>
      )}
      {permissions?.canCreate && (
        <ListItem>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <Tooltip title="Allows the creation of schema entries by extension schemas">
            <ListItemText primary="Create" />
          </Tooltip>
        </ListItem>
      )}
      {permissions?.canModify && (
        <ListItem>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <Tooltip title="Allows the modification of target schema entry fields by extension schemas">
            <ListItemText primary="Modify" />
          </Tooltip>
        </ListItem>
      )}
      {permissions?.canDelete && (
        <ListItem>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Tooltip title="Allows the deletion of schema entries by extension schemas">
            <ListItemText primary="Delete" />
          </Tooltip>
        </ListItem>
      )}
      <ListItem>
        <ListItemIcon>
          <AccessTimeIcon />
        </ListItemIcon>
        <ListItemText primary="Created At" secondary={schema.createdAt} />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <UpdateIcon />
        </ListItemIcon>
        <ListItemText primary="Updated At" secondary={schema.updatedAt} />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        {!introspection && (
          <ListItemText primary="Schema Owner" secondary={schema?.ownerModule?.toUpperCase()} />
        )}
      </ListItem>
    </List>
  );
};
