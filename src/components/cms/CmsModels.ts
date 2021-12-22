export interface SchemaUI {
  createdAt: string;
  name: string;
  updatedAt: string;
  _id: string;
  modelOptions: {
    conduit: {
      cms: {
        authentication: boolean;
        crudOperations: boolean;
      };
    };
  };
}
