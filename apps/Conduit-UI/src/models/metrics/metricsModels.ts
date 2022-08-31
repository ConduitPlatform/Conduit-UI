export interface MetricsData {
  timestamps: number[];
  counters: number[];
}

export interface MetricsLogsData {
  metric: {
    endpoint: string;
    instance: string;
    job: string;
    module_instance: string;
    namespace: string;
    pod: string;
    service: string;
    __name__: string;
  };
  values: [];
}
