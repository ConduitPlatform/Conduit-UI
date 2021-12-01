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
