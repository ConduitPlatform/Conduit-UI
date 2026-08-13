export type SchemaDataViewMode = 'tree' | 'json';

const STORAGE_KEY = 'conduit.schemaData.viewMode';

const isSchemaDataViewMode = (value: unknown): value is SchemaDataViewMode => {
  return value === 'tree' || value === 'json';
};

export const readSchemaDataViewMode = (): SchemaDataViewMode => {
  if (typeof window === 'undefined') return 'tree';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isSchemaDataViewMode(stored)) return stored;
  } catch {
    return 'tree';
  }
  return 'tree';
};

export const writeSchemaDataViewMode = (mode: SchemaDataViewMode): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    return;
  }
};
