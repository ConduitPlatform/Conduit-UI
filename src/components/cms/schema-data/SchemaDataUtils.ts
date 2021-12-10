import { v4 as uuidv4 } from 'uuid';

export const isFieldObject = (data: any) => {
  return data && typeof data !== 'string' && Object.keys(data).length > 0;
};

export const isFieldArray = (data: any) => {
  return data && Array.isArray(data);
};

export const isFieldRelation = (value: any) => {
  return value && value.type === 'Relation';
};

export const createDocumentArray = (document: any) => {
  return Object.keys(document).map((key) => {
    return { id: key, data: document[key] };
  });
};

export const getExpandableFields = (fields: any) => {
  const expandableFields: any[] = [];
  Object.keys(fields).forEach((field: any) => {
    const fieldContent = fields[field];

    if (fieldContent.type && Object.keys(fieldContent.type).length < 1) return;
    if (fieldContent.type && typeof fieldContent.type !== 'string') {
      expandableFields.push(field);
      const expandableChildFields = getExpandableFields(fieldContent.type);
      expandableChildFields.forEach((childField: string) => {
        expandableFields.push(childField);
      });
    }
  });

  return expandableFields;
};

export const getFieldsArray = (schemaFields: any) => {
  const fields: any = [];

  Object.keys(schemaFields).forEach((objectKey: any) => {
    const fieldContent = schemaFields[objectKey];

    if (fieldContent.type && Object.keys(fieldContent.type).length < 1) return;

    const fieldItem = {
      name: objectKey,
      data: fieldContent,
    };
    fields.push(fieldItem);
  });

  return fields;
};
