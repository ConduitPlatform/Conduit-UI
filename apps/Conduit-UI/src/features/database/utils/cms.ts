import { isArray } from 'lodash';
import { Endpoint } from '../models/customEndpointsModels';
import { OperationsEnum } from '../models/OperationsEnum';

const getCompiledFieldsOfSchema = (schemaSelected: any, schemas: any) => {
  if (schemaSelected) {
    const found = schemas.find((schema: any) => schema._id === schemaSelected);

    if (found) {
      return found.compiledFields;
    }
    return {};
  }
};

export const isValueIncompatible = (
  fieldName: string,
  externalInputType: string,
  availableFieldsOfSchema: any,
  isExternalInputArray?: boolean
) => {
  if (typeof fieldName === 'string') {
    if (fieldName.indexOf('.') !== -1) {
      const splitQuery = fieldName.split('.');
      const foundInnerSchema: any = availableFieldsOfSchema.find(
        (field: any) => field.name === splitQuery[0]
      );
      if (foundInnerSchema?.type) {
        const innerSchemaType = foundInnerSchema.type[splitQuery[1]]?.type;
        if (isArray(innerSchemaType) && externalInputType === 'Array') {
          return false;
        }
        if (
          innerSchemaType === externalInputType ||
          (innerSchemaType === 'Relation' && externalInputType === 'ObjectId')
        )
          return false;
        return true;
      }
      return;
    } else {
      const foundSchema: any = availableFieldsOfSchema.find(
        (schema: any) => schema.name === fieldName
      );

      if (foundSchema && foundSchema.type) {
        if (
          (isArray(foundSchema.type) && externalInputType === 'Array') ||
          (isArray(foundSchema.type) && isExternalInputArray)
        ) {
          return false;
        }
        if (
          foundSchema?.type === externalInputType ||
          (foundSchema?.type === 'Relation' && externalInputType === 'ObjectId')
        )
          return false;
        return true;
      }
    }
  }
};

export const getTypeOfValue = (fieldName: string, availableFieldsOfSchema: any) => {
  if (typeof fieldName === 'string') {
    if (fieldName.indexOf('.') !== -1) {
      const splitQuery = fieldName.split('.');
      const foundInnerSchema: any = availableFieldsOfSchema.find(
        (field: any) => field.name === splitQuery[0]
      );
      if (foundInnerSchema?.type) {
        const innerSchemaType = foundInnerSchema.type[splitQuery[1]]?.type;

        if (innerSchemaType) {
          return innerSchemaType;
        }
      }
      return;
    } else {
      const foundSchema: any = availableFieldsOfSchema.find(
        (schema: any) => schema.name === fieldName
      );

      if (foundSchema && foundSchema.type) {
        if (isArray(foundSchema.type)) {
          return 'Array';
        } else {
          return foundSchema?.type;
        }
      }
    }
  }
};

export const extractInputValueType = (type: any) => {
  if (type === undefined) {
    return '';
  }

  if (isArray(type)) {
    return '(Array)';
  }
  return `(${type})`;
};

const findFieldsWithTypes = (fields: any) => {
  const fieldKeys = Object.keys(fields);
  const fieldsWithTypes: any = [];
  fieldKeys.forEach((field) => {
    fieldsWithTypes.push({
      name: field,
      type: fields[field].type ?? fields[field],
      required: fields[field].required ?? false,
    });
  });
  return fieldsWithTypes;
};

const hasInvalidQueries = (queriesGroup: any) => {
  let queries: any = [];
  queriesGroup.forEach((q1: any) => {
    if (!q1.queries) return;
    queries = queries.concat(q1.queries);
    q1.queries.forEach((q2: any) => {
      if (!q2.queries) return;
      queries = queries.concat(q2.queries);
      q2.queries.forEach((q3: any) => {
        if (!q3.queries) return;
        queries = queries.concat(q3.queries);
      });
    });
  });

  return queries.some(
    (query: any) =>
      query.schemaField === '' ||
      query.operation === -1 ||
      !query.comparisonField ||
      query.comparisonField.type === '' ||
      query.comparisonField.value === ''
  );
};

const hasInvalidAssignments = (assignments: any) => {
  return assignments.some(
    (assignment: any) =>
      assignment.schemaField === '' ||
      assignment.action === -1 ||
      assignment.assignmentField.type === '' ||
      assignment.assignmentField.value === ''
  );
};

const hasInvalidInputs = (inputs: any) =>
  inputs.some((input: any) => input.name === '' || input.type === '' || input.location === -1);

const recursiveNodeIteration = (node: any, _id: any) => {
  if (node._id === _id) return node;
  if ('queries' in node) {
    let found;
    node.queries.forEach((q: any) => {
      if (q._id === _id) {
        found = q;
        return;
      }
      if ('queries' in q) {
        recursiveNodeIteration(q, _id);
      }
    });

    return found;
  }
};

const prepareQuery = (selectedQueries: any) => {
  let query = {};

  selectedQueries.forEach((node: any) => {
    const queries: any = [];

    if ('operator' in node) {
      node.queries.forEach((q1: any) => {
        const level1NodeQueries: any[] = [];
        if ('operator' in q1) {
          const level2NodeQueries: any[] = [];
          q1.queries.forEach((q2: any) => {
            if ('operator' in q2) {
              q2.queries.forEach((q3: any) => {
                level2NodeQueries.push(q3);
              });
              level1NodeQueries.push({ [q2.operator]: level2NodeQueries });
            } else {
              level1NodeQueries.push(q2);
            }
          });
          queries.push({ [q1.operator]: level1NodeQueries });
        } else {
          queries.push(q1);
        }
      });
      query = { ...query, [node.operator]: [...queries] };
    }
  });

  return query;
};

const disableSubmit = (endpoint: Endpoint) => {
  if (!endpoint.name) return true;
  if (!endpoint.selectedSchema) return true;
  if (endpoint.operation === -1) return true;

  let invalidQueries;
  let invalidAssignments;

  if (endpoint.operation === OperationsEnum.POST) {
    if (!endpoint.assignments || endpoint.assignments.length === 0) return true;
    invalidAssignments = hasInvalidAssignments(endpoint.assignments);
  }
  if (endpoint.operation === OperationsEnum.PUT) {
    if (!endpoint.queries || endpoint.queries.length === 0) return true;
    invalidQueries = hasInvalidQueries(endpoint.queries);
    if (!endpoint.assignments || endpoint.assignments.length < 1) return true;
    invalidAssignments = hasInvalidAssignments(endpoint.assignments);
  }
  if (endpoint.operation === OperationsEnum.PATCH) {
    if (!endpoint.queries || endpoint.queries.length === 0) return true;
    invalidQueries = hasInvalidQueries(endpoint.queries);
    if (!endpoint.assignments || endpoint.assignments.length < 1) return true;
    invalidAssignments = hasInvalidAssignments(endpoint.assignments);
  }
  if (endpoint.operation === OperationsEnum.DELETE) {
    if (!endpoint.queries || endpoint.queries.length === 0) return true;
    invalidQueries = hasInvalidQueries(endpoint.queries);
  }
  if (endpoint.operation === OperationsEnum.GET) {
    if (!endpoint.queries || endpoint.queries.length === 0) return true;
    invalidQueries = hasInvalidQueries(endpoint.queries);
  }

  if (invalidQueries || invalidAssignments) {
    return true;
  }
  const invalidInputs = hasInvalidInputs(endpoint.inputs);
  if (invalidInputs) {
    return true;
  }
};

export {
  findFieldsWithTypes,
  getCompiledFieldsOfSchema,
  hasInvalidQueries,
  hasInvalidAssignments,
  hasInvalidInputs,
  recursiveNodeIteration,
  prepareQuery,
  disableSubmit,
};
