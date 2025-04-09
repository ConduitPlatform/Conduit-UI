export interface StrategyFormProps<T> {
  name: string;
  data: T;
  onSubmit: (data: T) => void;
  onCancel: () => void;
}
