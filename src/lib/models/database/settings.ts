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

export type DatabaseRealtimeStatusCode =
  | 'unsupported'
  | 'disabled'
  | 'idle'
  | 'starting'
  | 'live'
  | 'degraded';

export type DatabaseRealtimeStatus = {
  status: DatabaseRealtimeStatusCode;
  engine: string;
  activeSchemaCount: number;
  lastEventAt?: string;
  message?: string;
};

export type DatabaseConfig = {
  readPreference: ReadPreference;
  writeConcern: WriteConcern;
  readConcern: ReadConcern;
  realtime?: {
    enabled: boolean;
  };
};
