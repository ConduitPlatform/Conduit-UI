import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, Button, Input, Checkbox } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { clearSelectedSchema } from '../../redux/slices/databaseSlice';
import FormControlLabel from '@mui/material/FormControlLabel';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import { ModifyOptions, Permissions, Schema } from '../../models/database/CmsModels';
import PermissionsDialog from './PermissionsDialog';

export const headerHeight = 64;

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
    if (selectedSchema && selectedSchema.ownerModule !== 'database') {
      return true;
    } else return false;
  };

  return (
    <Box
      boxShadow={3}
      sx={{
        zIndex: 9998,
        height: headerHeight,
        backgroundColor: 'background.paper',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        color: 'common.white',
      }}
      {...rest}>
      <Box display={'flex'} alignItems={'center'}>
        <Link href="/database/schemas">
          {/* TODO call dispatch clear cms */}
          <a style={{ textDecoration: 'none' }} onClick={handleBackButtonClick}>
            <Box
              sx={{
                height: 80,
                width: 80,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 3,
                cursor: 'pointer',
              }}>
              <ArrowBackIcon
                onClick={() => clearSelectedSchema}
                sx={{ height: 30, width: 30, color: 'common.white' }}
              />
            </Box>
          </a>
        </Link>
        <Input
          sx={{
            height: 5,
            padding: 1,
            marginRight: 3,
            '&:hover': {
              border: '1px solid',
              borderColor: 'rgba(255,255,255,0.5)',
            },
            borderBottom: '1px solid rgba(255,255,255,0.5)',
            color: 'common.white',
          }}
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
              sx={{
                color: '#FFFFFF',
                '&.Mui-checked': {
                  color: '#FFFFFF',
                },
              }}
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
              sx={{
                color: '#FFFFFF',
                '&.Mui-checked': {
                  color: '#FFFFFF',
                },
              }}
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
          Permissions
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button sx={{ margin: 2, color: 'common.white' }} onClick={() => handleData()}>
          <SaveIcon />
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
