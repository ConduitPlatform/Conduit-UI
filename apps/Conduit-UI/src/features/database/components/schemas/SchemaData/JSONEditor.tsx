import React, { FC, useEffect, useState } from 'react';
import { DocumentActions, EditDocumentActions } from './SchemaDataCardActions';
import { useAppDispatch } from '../../../../../redux/store';
import { Schema } from '../../../models/CmsModels';
import { asyncEditSchemaDocument } from '../../../store/databaseSlice';
import { enqueueErrorNotification } from '../../../../../utils/useNotifier';
import { Box, styled } from '@mui/material';
import JsonEditorComponent from '../../../../../components/common/JsonEditorComponent';

const StyledDocActions = styled(DocumentActions)(() => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
}));

interface Props {
  documents: any;
  schema: Schema;
  getSchemaDocuments: () => void;
  onDelete: () => void;
}

const JSONEditor: FC<Props> = ({ documents, getSchemaDocuments, schema, onDelete }) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [documentState, setDocumentState] = useState<any>(documents);
  const dispatch = useAppDispatch();

  const onEdit = () => {
    setEdit(!edit);
  };

  useEffect(() => {
    setDocumentState(documents);
  }, [documents]);

  const handleCancel = () => {
    setEdit(false);
    setDocumentState({});
    setTimeout(() => {
      setDocumentState(documents);
    }, 1);
  };

  const handleSave = () => {
    if (documentState !== undefined) {
      setEdit(false);
      const params = {
        schemaName: schema.name,
        documentId: documentState._id,
        documentData: documentState,
        getSchemaDocuments: getSchemaDocuments,
        onEditError: () => setDocumentState(documents),
      };

      dispatch(asyncEditSchemaDocument(params));
    } else {
      dispatch(enqueueErrorNotification('Please reformat your JSON in order to proceed!'));
    }
  };

  const handleChange = (changedText: any) => {
    setDocumentState(changedText.jsObject);
  };

  return (
    <Box
      sx={{
        '& $actionContainer': {
          display: 'none',
        },
        '&:hover $actionContainer': {
          display: 'flex',
        },
      }}>
      <Box
        sx={{
          mb: 2,
          height: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
        <StyledDocActions sx={{ mb: 2 }} onEdit={onEdit} onDelete={onDelete} edit={edit} />
      </Box>
      <JsonEditorComponent
        id={documents._id}
        placeholder={documentState}
        onChange={handleChange}
        viewOnly={!edit}
        confirmGood={!edit}
        height="fit-content"
        width="100%"
      />
      <EditDocumentActions edit={edit} handleCancel={handleCancel} handleSave={handleSave} />
    </Box>
  );
};

export default JSONEditor;
