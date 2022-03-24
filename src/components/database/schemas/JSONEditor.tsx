import React, { FC, useEffect, useState } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import { localeEn } from '../../../models/JSONEditorAjrmLocale';
import { DocumentActions, EditDocumentActions } from './SchemaDataCardActions';
import { useAppDispatch } from '../../../redux/store';
import { Schema } from '../../../models/database/CmsModels';
import { asyncEditSchemaDocument } from '../../../redux/slices/databaseSlice';
import { enqueueErrorNotification } from '../../../utils/useNotifier';
import makeStyles from '@mui/styles/makeStyles';
import { Box } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
  },
}));

interface Props {
  documents: any;
  schema: Schema;
  getSchemaDocuments: () => void;
  onDelete: () => void;
}

const JSONEditor: FC<Props> = ({ documents, getSchemaDocuments, schema, onDelete }) => {
  const classes = useStyles();
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
          marginTop: 1,
          height: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
        <DocumentActions
          className={classes.actionContainer}
          onEdit={onEdit}
          onDelete={onDelete}
          edit={edit}
        />
      </Box>
      <JSONInput
        id={documents._id}
        placeholder={documentState}
        locale={localeEn}
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
