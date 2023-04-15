import { FunctionType } from '../models/FunctionsModels';

export const formatData = (data: FunctionType[]) => {
  return data.map((u) => {
    return {
      _id: u._id,
      Name: u.name,
      'Updated At': u.updatedAt,
    };
  });
};

export const headers = [
  { title: '_id', sort: '_id' },
  { title: 'Name', sort: 'name' },
  { title: 'Updated At', sort: 'updatedAt' },
];
