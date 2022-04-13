import { OperationsEnum } from '../models/OperationsEnum';

export const getOperation = (endpoint: any) => {
  switch (endpoint.operation) {
    case OperationsEnum.POST:
      return 'POST';
    case OperationsEnum.PUT:
      return 'PUT';
    case OperationsEnum.DELETE:
      return 'DELETE';
    case OperationsEnum.GET:
      return 'GET';
    case OperationsEnum.PATCH:
      return 'PATCH';
  }
};
