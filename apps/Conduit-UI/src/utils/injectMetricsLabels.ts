import { NAMESPACE } from '../http/requestsConfig';

export const completeExpression = (
  expression: string,
  labels?: { [key: string]: string | number | boolean }
) => {
  let completeExpression = expression;
  let labelString = '{';
  if (!labels && NAMESPACE && NAMESPACE.length > 0) {
    labelString = `{namespace="${NAMESPACE}"}`;
    return completeExpression.replace('{inject_labels}', labelString);
  } else if (!labels) {
    return completeExpression.replace('{inject_labels}', '');
  }
  if (NAMESPACE && NAMESPACE.length > 0) {
    labelString = `{namespace="${NAMESPACE}",`;
  }
  Object.keys(labels).forEach((key, index) => {
    if (index === 0) {
      labelString += `${key}="${labels[key]}"`;
    } else {
      labelString += `,${key}="${labels[key]}"`;
    }
  });
  labelString += '}';
  completeExpression = completeExpression.replace('{inject_labels}', labelString);
  return completeExpression;
};
