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
    transport: string | undefined;
  };
  values: [];
}

export interface MetricsLogsDataRaw {
  data: {
    result: MetricsLogsData[];
    resultType: string;
  };
  status: string;
}

export interface MultipleSeries {
  name: string;
  data: number[];
}

export interface ExpressionsRoutesArray {
  title: string;
  expression: string;
  labels: { [key: string]: string | number | boolean };
}
