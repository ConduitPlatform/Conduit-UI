import React, { FC, useState } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import { DocumentActions, EditDocumentActions } from './SchemaDataCardActions';
import { makeStyles } from '@material-ui/styles';
import { useAppDispatch } from '../../../redux/store';
import { Schema } from '../../../models/cms/CmsModels';
import { asyncEditSchemaDocument } from '../../../redux/slices/cmsSlice';
import { enqueueErrorNotification } from '../../../utils/useNotifier';

const useStyles = makeStyles((theme) => ({
  container: {
    '& $actionContainer': {
      display: 'none',
    },
    '&:hover $actionContainer': {
      display: 'flex',
    },
  },
  paper: {
    marginTop: '5px',
    height: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
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
    <div className={classes.container}>
      <div className={classes.paper}>
        <DocumentActions
          className={classes.actionContainer}
          onEdit={onEdit}
          onDelete={onDelete}
          edit={edit}
        />
      </div>
      <JSONInput
        id={documents._id}
        placeholder={documentState}
        locale={locale}
        onChange={handleChange}
        viewOnly={!edit}
        confirmGood={!edit}
        height="fit-content"
        width="100%"
      />
      <EditDocumentActions edit={edit} handleCancel={handleCancel} handleSave={handleSave} />
    </div>
  );
};

export default JSONEditor;
