import OperationsEnum from '../models/OperationsEnum';

export const getOperation = (endpoint: any) => {
  if (endpoint.operation === OperationsEnum.POST) {
    return 'POST';
  }
  if (endpoint.operation === OperationsEnum.PUT) {
    return 'PUT';
  }
  if (endpoint.operation === OperationsEnum.DELETE) {
    return 'DELETE';
  }
  if (endpoint.operation === OperationsEnum.GET) {
    return 'GET';
  }
  if (endpoint.operation === OperationsEnum.PATCH) {
    return 'PATCH';
  }
};
