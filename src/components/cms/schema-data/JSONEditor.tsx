import React, { FC, useState } from 'react';
import { Paper, Button } from '@material-ui/core';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

interface Props {
  value: any;
  documents: any;
  getSchemaDocuments: any;
  disabled?: boolean;
}

const JSONEditor: FC<Props> = ({ value, documents, getSchemaDocuments, disabled }) => {
  const [edit, setEdit] = useState<boolean>(false);

  return (
    <>
      <Paper style={{ height: '20px' }}></Paper>
      <JSONInput
        id="a_unique_id"
        placeholder={documents}
        locale={locale}
        height="fit-content"
        width="100%"
      />
    </>
  );
};

export default JSONEditor;
