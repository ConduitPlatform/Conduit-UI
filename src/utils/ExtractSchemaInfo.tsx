import React, { useState } from 'react';
import { List, ListItemIcon, ListItemText, ListItem, Collapse } from '@material-ui/core';
import ExtensionIcon from '@material-ui/icons/Extension';
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import DeleteIcon from '@material-ui/icons/Delete';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import UpdateIcon from '@material-ui/icons/Update';
import PeopleIcon from '@material-ui/icons/People';
import EditAttributesIcon from '@material-ui/icons/EditAttributes';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import TocIcon from '@material-ui/icons/Toc';
import PersonIcon from '@material-ui/icons/Person';
import { Schema } from '../models/database/CmsModels';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  nested: {
    paddingLeft: theme.spacing(3),
  },
}));

export const ExtractSchemaInfo = (schema: Schema) => {
  const classes = useStyles();
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
              <ListItem className={classes.nested}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Authentication"
                  secondary={cms.authentication ? 'Enabled' : 'Disabled'}
                />
              </ListItem>
              <ListItem className={classes.nested}>
                <ListItemIcon>
                  <EditAttributesIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Crud operations"
                  secondary={cms.crudOperations ? 'Enabled' : 'Disabled'}
                />
              </ListItem>
              <ListItem className={classes.nested}>
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
          <ListItemText primary="Schema can be extended" />
        </ListItem>
      )}
      {permissions?.canCreate && (
        <ListItem>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Schema can create" />
        </ListItem>
      )}
      {permissions?.canModify && (
        <ListItem>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Schema can be modified" />
        </ListItem>
      )}
      {permissions?.canDelete && (
        <ListItem>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="Schema can be deleted" />
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
        <ListItemText primary="Schema Owner" secondary={schema.ownerModule.toUpperCase()} />
      </ListItem>
    </List>
  );
};
