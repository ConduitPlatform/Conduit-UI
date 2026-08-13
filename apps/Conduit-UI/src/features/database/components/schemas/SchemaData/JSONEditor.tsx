import React, { FC, useEffect, useState } from 'react';
import { DocumentActions, EditDocumentActions } from './SchemaDataCardActions';
import { useAppDispatch } from '../../../../../redux/store';
import { Schema } from '../../../models/CmsModels';
import { asyncEditSchemaDocument } from '../../../store/databaseSlice';
import {
  enqueueErrorNotification,
  enqueueSuccessNotification,
} from '../../../../../hooks/useNotifier';
import { Box, Card, CardContent, CardProps, IconButton, styled, Tooltip } from '@mui/material';
import { CopyAllOutlined } from '@mui/icons-material';
import JsonEditorComponent from '../../../../../components/common/JsonEditorComponent';
import { copyJsonToClipboard } from './SchemaDataUtils';

const StyledDocActions = styled(DocumentActions)(() => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
}));

interface Props extends CardProps {
  documents: any;
  schema: Schema;
  getSchemaDocuments: () => void;
  onDelete: () => void;
}

const JSONEditor: FC<Props> = ({ documents, getSchemaDocuments, schema, onDelete, ...rest }) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [documentState, setDocumentState] = useState<any>(documents);
  const [editorNonce, setEditorNonce] = useState(0);
  const dispatch = useAppDispatch();

  const onEdit = () => {
    setEdit(!edit);
  };

  useEffect(() => {
    setDocumentState(documents);
  }, [documents]);

  const handleCancel = () => {
    setEdit(false);
    setDocumentState(documents);
    setEditorNonce((nonce) => nonce + 1);
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

  const handleCopy = () => {
    copyJsonToClipboard(documentState)
      .then(() => {
        dispatch(enqueueSuccessNotification('JSON copied to clipboard'));
      })
      .catch(() => {
        dispatch(enqueueErrorNotification('Failed to copy JSON'));
      });
  };

  return (
    <Card variant="outlined" {...rest}>
      <Box
        sx={{
          mb: 1,
          mt: 1,
          mr: 1,
          height: 'auto',
          minHeight: 32,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
        {!edit && (
          <Tooltip title="Copy JSON">
            <IconButton sx={{ mr: 1 }} size="small" onClick={handleCopy} color="primary">
              <CopyAllOutlined sx={{ height: 22, width: 22 }} />
            </IconButton>
          </Tooltip>
        )}
        <StyledDocActions onEdit={onEdit} onDelete={onDelete} edit={edit} />
      </Box>
      <CardContent>
        <JsonEditorComponent
          key={`${documents._id}-${editorNonce}`}
          id={documents._id}
          placeholder={documentState}
          onChange={handleChange}
          viewOnly={!edit}
          confirmGood={!edit}
          height="fit-content"
          width="100%"
        />
      </CardContent>
      <EditDocumentActions edit={edit} handleCancel={handleCancel} handleSave={handleSave} />
    </Card>
  );
};

export default JSONEditor;
