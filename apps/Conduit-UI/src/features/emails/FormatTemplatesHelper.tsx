import { EmailTemplateType } from './EmailModels';

export const formatData = (data: EmailTemplateType[]) => {
  return data.map((u) => {
    return {
      _id: u._id,
      Name: u.name,
      External: u.externalManaged,
      'Updated At': u.updatedAt,
    };
  });
};

export const headers = [
  { title: '_id', sort: '_id' },
  { title: 'Name', sort: 'name' },
  { title: 'External', sort: 'externalManaged' },
  { title: 'Updated At', sort: 'updatedAt' },
];
