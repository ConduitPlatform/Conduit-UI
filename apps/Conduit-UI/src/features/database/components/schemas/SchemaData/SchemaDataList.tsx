import React, { FC } from 'react';
import { Schema } from '../../../models/CmsModels';
import SchemaDataCard from './SchemaDataCard';
import JSONEditor from './JSONEditor';
import { SchemaDataViewMode } from './schemaDataViewMode';

const documentCardSx = {
  background: 'rgba(0,0,0,0.2)',
  margin: 1,
  paddingLeft: 1,
  position: 'relative' as const,
};

interface Props {
  viewMode: SchemaDataViewMode;
  documents: any[];
  schema: Schema;
  getSchemaDocuments: () => void;
  onDelete: (index: number) => void;
}

const SchemaDataList: FC<Props> = ({
  viewMode,
  documents,
  schema,
  getSchemaDocuments,
  onDelete,
}) => {
  switch (viewMode) {
    case 'json':
      return (
        <>
          {documents.map((docs, index) => (
            <JSONEditor
              documents={docs}
              getSchemaDocuments={getSchemaDocuments}
              schema={schema}
              onDelete={() => onDelete(index)}
              key={docs?._id ?? index}
              sx={documentCardSx}
            />
          ))}
        </>
      );
    case 'tree':
      return (
        <>
          {documents.map((docs, index) => (
            <SchemaDataCard
              schema={schema}
              documents={docs}
              sx={documentCardSx}
              onDelete={() => onDelete(index)}
              getSchemaDocuments={getSchemaDocuments}
              key={`card${index}`}
              id={docs?._id}
            />
          ))}
        </>
      );
    default: {
      const exhaustiveCheck: never = viewMode;
      throw new Error(`Unhandled view mode: ${exhaustiveCheck}`);
    }
  }
};

export default SchemaDataList;
