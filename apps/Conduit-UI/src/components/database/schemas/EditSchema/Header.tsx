import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, Button, Input } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { clearSelectedSchema } from '../../../../redux/slices/databaseSlice';
import { enqueueInfoNotification } from '../../../../utils/useNotifier';
import {
  ICrudOperations,
  ModifyOptions,
  Permissions,
  Schema,
} from '../../../../models/database/CmsModels';
import PermissionsDialog from './PermissionsDialog';
import CrudOperationsDialog from './CrudOperationsDialog';
import { useRouter } from 'next/router';
import ReturnDialog from './ReturnDialog';

export const headerHeight = 64;

interface Props {
  name: string;
  authentication: boolean;
  crudOperations: ICrudOperations;
  selectedSchema?: Schema;
  permissions: Permissions;
  readOnly: boolean;
  handleSave: (name: string, crud: ICrudOperations, permissions: Permissions) => void;
  introspection?: boolean;
  editableFields?: { newTypeFields: [] };
  modified: boolean;
}

const Header: FC<Props> = ({
  name,
  authentication,
  selectedSchema,
  crudOperations,
  permissions,
  readOnly,
  handleSave,
  introspection,
  editableFields,
  modified,
  ...rest
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [schemaName, setSchemaName] = useState(name);
  const [schemaCrudOperations, setSchemaCrudOperations] = useState<ICrudOperations>({
    create: { enabled: false, authenticated: false },
    read: { enabled: false, authenticated: false },
    delete: { enabled: false, authenticated: false },
    update: { enabled: false, authenticated: false },
  });
  const [schemaPermissions, setSchemaPermissions] = useState<Permissions>({
    extendable: false,
    canCreate: false,
    canModify: ModifyOptions.Everything,
    canDelete: false,
  });
  const [permissionsDialog, setPermissionsDialog] = useState<boolean>(false);
  const [crudOperationsDialog, setCrudOperationsDialog] = useState<boolean>(false);
  const [returnDialog, setReturnDialog] = useState<boolean>(false);

  useEffect(() => {
    setSchemaName(name);
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
    handleSave(schemaName, schemaCrudOperations, schemaPermissions);
  };

  const handleBackButtonClick = () => {
    dispatch(clearSelectedSchema());
    if (introspection) {
      router.push({ pathname: '/database/introspection' });
    } else router.push({ pathname: '/database/schemas' });
  };

  const handleReturnButton = () => {
    if (modified) {
      setReturnDialog(true);
    } else {
      handleBackButtonClick();
    }
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
        <Box>
          {/* TODO call dispatch clear cms */}
          <a style={{ textDecoration: 'none' }} onClick={() => handleReturnButton()}>
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
        </Box>
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
        <Box display="flex" gap={4}>
          <Button variant="outlined" onClick={() => setCrudOperationsDialog(true)}>
            Crud operations
          </Button>
          <Button variant="outlined" onClick={() => setPermissionsDialog(true)}>
            Permissions
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          sx={{ margin: 2, color: 'common.white' }}
          onClick={() => handleData()}
          disabled={!editableFields?.newTypeFields.length}>
          <SaveIcon />
          <Typography>{introspection ? 'Finalize' : 'Save'}</Typography>
        </Button>
      </Box>
      <PermissionsDialog
        open={permissionsDialog}
        introspection={introspection}
        permissions={schemaPermissions}
        setPermissions={setSchemaPermissions}
        handleClose={() => setPermissionsDialog(false)}
        selectedSchema={selectedSchema}
      />
      <CrudOperationsDialog
        open={crudOperationsDialog}
        introspection={introspection}
        crudOperations={schemaCrudOperations}
        setCrudOperations={setSchemaCrudOperations}
        handleClose={() => setCrudOperationsDialog(false)}
        selectedSchema={selectedSchema}
      />
      <ReturnDialog
        open={returnDialog}
        setOpen={setReturnDialog}
        name={name}
        introspection={introspection}
      />
    </Box>
  );
};

export default Header;
