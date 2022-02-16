import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, Button, Input, Checkbox } from '@material-ui/core';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { clearSelectedSchema } from '../../redux/slices/cmsSlice';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import { ModifyOptions, Permissions, Schema } from '../../models/cms/CmsModels';
import PermissionsDialog from './PermissionsDialog';

export const headerHeight = 64;

const useStyles = makeStyles((theme) => ({
  header: {
    zIndex: 9998,
    height: headerHeight,
    backgroundColor: '#303030',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    right: 0,
    left: 0,
  },
  input: {
    height: theme.spacing(5),
    padding: theme.spacing(1),
    marginRight: theme.spacing(3),
    '&:hover': {
      border: '1px solid',
      borderColor: 'rgba(255,255,255,0.5)',
    },
    borderBottom: '1px solid rgba(255,255,255,0.5)',
  },
  checkbox: {
    color: '#FFFFFF',
    '&.Mui-checked': {
      color: '#FFFFFF',
    },
  },
  backIconContainer: {
    height: theme.spacing(8),
    width: theme.spacing(8),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(3),
    cursor: 'pointer',
  },
  backIcon: {
    height: theme.spacing(5),
    width: theme.spacing(5),
  },
  selectMenu: {
    backgroundColor: theme.palette.primary.main,
  },
  saveButton: {
    margin: theme.spacing(0, 2),
  },
  saveIcon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  colorWhite: {
    color: theme.palette.common.white,
  },
  saveBox: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface Props {
  name: string;
  authentication: boolean;
  crudOperations: boolean;
  selectedSchema?: Schema;
  permissions: Permissions;
  readOnly: boolean;
  handleSave: (name: string, readOnly: boolean, crud: boolean, permissions: Permissions) => void;
}

const Header: FC<Props> = ({
  name,
  authentication,
  selectedSchema,
  crudOperations,
  permissions,
  readOnly,
  handleSave,
  ...rest
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [schemaName, setSchemaName] = useState(name);
  const [schemaAuthentication, setSchemaAuthentication] = useState(false);
  const [schemaCrudOperations, setSchemaCrudOperations] = useState(false);
  const [schemaPermissions, setSchemaPermissions] = useState<Permissions>({
    extendable: false,
    canCreate: false,
    canModify: ModifyOptions.Everything,
    canDelete: false,
  });
  const [dialog, setDialog] = useState(false);

  useEffect(() => {
    setSchemaName(name);
    if (authentication !== null && authentication !== undefined) {
      setSchemaAuthentication(authentication);
    }
    if (crudOperations !== null && crudOperations !== undefined) {
      setSchemaCrudOperations(crudOperations);
    }
    if (permissions) {
      setSchemaPermissions({ ...permissions });
    }
  }, [authentication, crudOperations, name, permissions]);

  const handleDataName = (value: string) => {
    const regex = /[^a-z0-9_]/gi;
    if (regex.test(value)) {
      dispatch(enqueueInfoNotification('The schema name can only contain alpharithmetics and _'));
    }

    setSchemaName(value.replace(/[^a-z0-9_]/gi, ''));
  };

  const handleData = () => {
    handleSave(schemaName, schemaAuthentication, schemaCrudOperations, schemaPermissions);
  };

  const handleBackButtonClick = () => {
    dispatch(clearSelectedSchema());
  };

  const isDisabled = () => {
    if (selectedSchema && selectedSchema.ownerModule !== 'cms') {
      return true;
    } else return false;
  };

  return (
    <Box boxShadow={3} className={clsx(classes.header, classes.colorWhite)} {...rest}>
      <Box display={'flex'} alignItems={'center'}>
        <Link href="/cms/schemas">
          {/* TODO call dispatch clear cms */}
          <a style={{ textDecoration: 'none' }} onClick={handleBackButtonClick}>
            <Box className={classes.backIconContainer}>
              <ArrowBackIcon
                onClick={() => clearSelectedSchema}
                className={clsx(classes.backIcon, classes.colorWhite)}
              />
            </Box>
          </a>
        </Link>
        <Input
          className={clsx(classes.input, classes.colorWhite)}
          id="data-name"
          placeholder={'Schema name'}
          onChange={(event) => handleDataName(event.target.value)}
          disableUnderline
          value={schemaName}
          readOnly={readOnly}
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              className={classes.checkbox}
              checked={schemaAuthentication}
              disabled={isDisabled()}
              onChange={(event) => {
                setSchemaAuthentication(event.target.checked);
              }}
              name="authentication"
            />
          }
          label={<Typography variant="caption">Authentication required</Typography>}
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              className={classes.checkbox}
              checked={schemaCrudOperations}
              disabled={isDisabled()}
              onChange={(event) => {
                setSchemaCrudOperations(event.target.checked);
              }}
              name="crudOperations"
            />
          }
          label={<Typography variant="caption">Allow Crud Operations</Typography>}
        />
        <Button variant="outlined" onClick={() => setDialog(true)}>
          Edit permissions
        </Button>
      </Box>
      <Box className={classes.saveBox}>
        <Button
          className={clsx(classes.saveButton, classes.colorWhite)}
          onClick={() => handleData()}>
          <SaveIcon className={classes.saveIcon} />
          <Typography>Save</Typography>
        </Button>
      </Box>
      <PermissionsDialog
        open={dialog}
        permissions={schemaPermissions}
        setPermissions={setSchemaPermissions}
        handleClose={() => setDialog(false)}
        selectedSchema={selectedSchema}
      />
    </Box>
  );
};

export default Header;
