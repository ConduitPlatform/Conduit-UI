import { useTheme } from 'next-themes';
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

type JsonViewerProps = {
  json: Record<string, any>;
};

const customLightStyles = {
  ...defaultStyles,
  container: 'bg-secondary m-3 p-3 rounded-lg ',
  label: 'text-primary',
  nullValue: 'text-json-null',
  stringValue: 'text-json-string wrap-break-word',
  booleanValue: 'text-json-boolean',
  numberValue: 'text-json-number font-medium',
};

const customDarkStyles = {
  ...darkStyles,
  container: 'bg-secondary m-3 p-3 rounded-lg',
  label: 'text-primary',
  nullValue: 'text-json-null',
  stringValue: 'text-json-string wrap-break-word',
  booleanValue: 'text-json-boolean',
  numberValue: 'text-json-number font-medium',
};

export default function JsonViewer({ json }: JsonViewerProps) {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? customDarkStyles : customLightStyles;
  return <JsonView data={json} shouldExpandNode={allExpanded} style={styles} />;
}
