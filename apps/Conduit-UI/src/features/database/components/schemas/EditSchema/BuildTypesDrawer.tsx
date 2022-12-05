import React, { FC } from 'react';
import Drawer from '@mui/material/Drawer';
import SimpleForm from '../../types/SimpleType/SimpleForm';
import BooleanForm from '../../types/BooleanType/BooleanForm';
import GroupForm from '../../types/GroupType/GroupForm';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import EnumForm from '../../types/EnumType/EnumForm';
import ObjectIdForm from '../../types/ObjectIdType/ObjectIdForm';
import RelationForm from '../../types/RelationType/RelationForm';
import { IDrawerData } from '../../../models/BuildTypesModels';
import JSONForm from '../../types/JSONType/JSONForm';

interface Props {
  // drawerData: IDrawerData;
  disabledProps: boolean;
  drawerData: any; //todo fix this
  readOnly: boolean;
  onSubmit: (data: any) => void;
  onClose: () => void;
  selectedItem: any;
  duplicateId: boolean;
  invalidName: boolean;
}

const BuildTypesDrawer: FC<Props> = ({
  disabledProps,
  drawerData,
  readOnly,
  onSubmit,
  onClose,
  selectedItem,
  duplicateId,
  invalidName,
  ...rest
}) => {
  const handleForm = (data: IDrawerData) => {
    switch (data.type) {
      case 'Text':
        return (
          <SimpleForm
            disabledProps={disabledProps}
            readOnly={readOnly}
            onSubmit={onSubmit}
            drawerData={drawerData}
            onClose={onClose}
            selectedItem={selectedItem}
          />
        );
      case 'Number':
        return (
          <SimpleForm
            disabledProps={disabledProps}
            readOnly={readOnly}
            onSubmit={onSubmit}
            drawerData={drawerData}
            onClose={onClose}
            selectedItem={selectedItem}
          />
        );
      case 'Date':
        return (
          <SimpleForm
            disabledProps={disabledProps}
            readOnly={readOnly}
            onSubmit={onSubmit}
            drawerData={drawerData}
            onClose={onClose}
            selectedItem={selectedItem}
          />
        );
      case 'Enum':
        return (
          <EnumForm
            disabledProps={disabledProps}
            readOnly={readOnly}
            onSubmit={onSubmit}
            drawerData={drawerData}
            onClose={onClose}
            selectedItem={selectedItem}
          />
        );
      case 'Boolean':
        return (
          <BooleanForm
            disabledProps={disabledProps}
            readOnly={readOnly}
            onSubmit={onSubmit}
            drawerData={drawerData}
            onClose={onClose}
            selectedItem={selectedItem}
          />
        );
      case 'ObjectId':
        return (
          <ObjectIdForm
            disabledProps={disabledProps}
            readOnly={readOnly}
            onSubmit={onSubmit}
            drawerData={drawerData}
            onClose={onClose}
            selectedItem={selectedItem}
          />
        );
      case 'Group':
        return (
          <GroupForm
            disabledProps={disabledProps}
            readOnly={readOnly}
            onSubmit={onSubmit}
            drawerData={drawerData}
            onClose={onClose}
            selectedItem={selectedItem}
          />
        );
      case 'Relation':
        return (
          <RelationForm
            disabledProps={disabledProps}
            readOnly={readOnly}
            onSubmit={onSubmit}
            drawerData={drawerData}
            onClose={onClose}
            selectedItem={selectedItem}
          />
        );
      case 'JSON':
        return (
          <JSONForm
            disabledProps={disabledProps}
            readOnly={readOnly}
            onSubmit={onSubmit}
            drawerData={drawerData}
            onClose={onClose}
            selectedItem={selectedItem}
          />
        );
      default:
        return (
          <Box>
            <Typography>Something went wrong</Typography>
            <Button onClick={onClose} color="primary">
              Go Back
            </Button>
          </Box>
        );
    }
  };

  return (
    <Drawer
      anchor="right"
      open={drawerData.open}
      sx={{
        '& .MuiDrawer-paper': {
          width: '25%',
          alignItems: 'center',
        },
      }}
      {...rest}>
      <Typography
        variant={'subtitle1'}
        sx={{
          width: '100%',
          padding: 2,
          fontWeight: 'bold',
          borderBottom: '1px solid',
          borderColor: 'primary.main,',
        }}>
        Configuration of {drawerData.type} field
      </Typography>
      {handleForm(drawerData)}
      {duplicateId && (
        <Box textAlign={'center'}>
          <Typography variant={'button'} sx={{ color: 'red', marginBottom: 2 }}>
            Warning! Duplicate Field name
          </Typography>
          <Typography variant={'body1'}>Please provide a unique field name</Typography>
        </Box>
      )}
      {invalidName && (
        <Box textAlign={'center'}>
          <Typography variant={'button'} sx={{ color: 'red', marginBottom: 2 }}>
            Warning! Invalid Field name
          </Typography>
          <Typography variant={'body1'}>Field name type is forbidden</Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default BuildTypesDrawer;
