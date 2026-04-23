export type ReadPreference =
  | 'primary'
  | 'primaryPreferred'
  | 'secondary'
  | 'secondaryPreferred'
  | 'nearest';
export type WriteConcern = '1' | 'majority';
export type ReadConcern =
  | 'local'
  | 'available'
  | 'majority'
  | 'linearizable'
  | 'snapshot';

export type DatabaseConfig = {
  readPreference: ReadPreference;
  writeConcern: WriteConcern;
  readConcern: ReadConcern;
};
