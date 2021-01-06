export const cloneItem = (destination, item, droppableDestination) => {
  const clone = Array.from(destination);

  clone.splice(droppableDestination.index, 0, { ...item });
  return clone;
};

export const addToGroup = (data, groupId, item, droppableDestination) => {
  let idPosition = data.findIndex((i) => i.name === groupId);
  const clone = Array.from(data);

  clone[idPosition].content.splice(droppableDestination.index, 0, { ...item });

  return clone;
};

export const addToChildGroup = (data, groupId, item, droppableDestination) => {
  const clone = Array.from(data);
  const idPosition = data.findIndex((object) => {
    if (object.content) {
      return object.content.find((content) => content.name === groupId);
    }
  });

  const idPosition2 = data[idPosition].content.findIndex(
    (object2) => object2.name === groupId
  );

  clone[idPosition].content[idPosition2].content.splice(droppableDestination.index, 0, {
    ...item,
  });
  return clone;
};

export const updateItem = (items, item, index) => {
  const updated = Array.from(items);

  updated.splice(index, 1, { ...item });
  return updated;
};

export const updateGroupItem = (data, groupId, item, position) => {
  let idPosition = data.findIndex((i) => i.name === groupId);
  const clone = Array.from(data);

  clone[idPosition].content.splice(position, 1, { ...item });

  return clone;
};

export const updateGroupChildItem = (data, groupId, item, position) => {
  const clone = Array.from(data);
  const idPosition = data.findIndex((object) => {
    return object.content.find((content) => content.name === groupId);
  });

  const idPosition2 = data[idPosition].content.findIndex(
    (object2) => object2.name === groupId
  );

  clone[idPosition].content[idPosition2].content.splice(position, 1, { ...item });
  return clone;
};

export const deleteItem = (items, index) => {
  const deleted = Array.from(items);

  deleted.splice(index, 1);
  return deleted;
};

export const reorderItems = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const getSchemaFields = (schemaFields) => {
  const keys = Object.keys(schemaFields);
  const fields = [];
  keys.forEach((k) => {
    if (typeof schemaFields[k] !== 'string') {
      const field = schemaFields[k];
      fields.push({ name: k, ...constructFieldType(field) });
    }
  });
  return fields;
};

const checkIsChildOfObject = (innerFields) => {
  const type = typeof innerFields;
  return type !== 'string';
};

const constructFieldType = (field) => {
  const typeField = {};
  if (checkIsChildOfObject(field.type)) {
    typeField.isArray = Array.isArray(field.type);
    if (typeField.isArray) {
      let obj = {};
      field.type.forEach((f) => {
        obj = { ...obj, ...f };
      });
      typeField.content = getSchemaFields(obj);
    } else {
      typeField.content = getSchemaFields(field.type);
    }
  }
  typeField.isArray = Array.isArray(field.type);
  if (typeField.isArray) {
    typeField.type = field.type[0];
  } else {
    typeField.type = field.type;
  }
  typeField.type = typeTransformer(typeField.type);
  if (typeField.type === '') {
    typeField.type = 'Group';
  }

  if (typeField.type !== 'Group') {
    typeField.unique = field.unique ? field.unique : false;
  }

  typeField.select = field.select ? field.select : false;
  typeField.required = field.required ? field.required : false;

  if (field.default !== undefined && field.default !== null) {
    typeField.default = field.default;
  }

  if (field.enum !== undefined && field.enum !== null) {
    typeField.enumValues = field.enum;
    typeField.isEnum = true;
  }

  if (field.type === 'Relation') {
    typeField.model = field.model;
    typeField.relation = field.relation;
  }

  return typeField;
};

const typeTransformer = (type) => {
  if (!type) {
    return '';
  }
  switch (type) {
    case 'String':
      return 'Text';
    case 'Number':
      return 'Number';
    case 'Date':
      return 'Date';
    case 'ObjectId':
      return 'ObjectId';
    case 'Boolean':
      return 'Boolean';
    case 'Relation':
      return 'Relation';
    case 'Enum':
      return 'Enum';
    default:
      return '';
  }
};

const prepareTypes = (type, isArray, content, enumType) => {
  switch (type) {
    case 'Text':
      return isArray ? ['String'] : 'String';
    case 'Number':
      return isArray ? ['Number'] : 'Number';
    case 'Date':
      return isArray ? ['Date'] : 'Date';
    case 'Boolean':
      return isArray ? ['Boolean'] : 'Boolean';
    case 'ObjectId':
      return 'ObjectId';
    case 'Relation':
      return 'Relation';
    case 'JSON':
      return 'JSON';
    case 'Enum':
      return enumType === 'Text' ? 'String' : 'Number';
    case 'Group':
      return prepareFields(content);
    default:
      break;
  }
};

export const prepareFields = (typeFields) => {
  let deconstructed = {};
  if (!typeFields) {
    return deconstructed;
  }
  typeFields.forEach((u) => {
    const clone = Object.assign({}, { ...u });
    const name = clone.name;
    let fields;
    if (clone.type === 'Group') {
      if (clone.isArray) {
        fields = {
          select: clone.select ? clone.select : false,
          required: clone.required ? clone.required : false,
          type: [
            prepareTypes(
              clone.isEnum ? 'Enum' : clone.type,
              clone.isArray,
              clone.content,
              clone.isEnum ? clone.type : null
            ),
          ],
        };
      } else {
        fields = {
          select: clone.select ? clone.select : false,
          required: clone.required ? clone.required : false,
          type: prepareTypes(
            clone.isEnum ? 'Enum' : clone.type,
            clone.isArray,
            clone.content,
            clone.isEnum ? clone.type : null
          ),
        };
      }
    } else {
      fields = {
        type: clone.type
          ? prepareTypes(
              clone.isEnum ? 'Enum' : clone.type,
              clone.isArray,
              clone.content,
              clone.isEnum ? clone.type : null
            )
          : '',
        unique: clone.unique ? clone.unique : false,
        select: clone.select ? clone.select : false,
        required: clone.required ? clone.required : false,
      };
    }
    if (clone.default !== undefined && clone.default !== null) {
      fields.default = clone.default;
    }

    if (clone.isEnum) {
      fields.enum = clone.enumValues;
    }

    if (clone.type === 'Relation') {
      fields.model = clone.model.toString();
    }

    delete clone.name;
    if (clone.type === 'Group') {
      deconstructed = { ...deconstructed, [name]: { ...fields } };
    } else {
      deconstructed = { ...deconstructed, [name]: { ...fields } };
    }
  });
  return deconstructed;
};
