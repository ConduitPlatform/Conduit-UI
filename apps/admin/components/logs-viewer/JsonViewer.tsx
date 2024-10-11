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
  nullValue: 'text-[#007f9b]',
  stringValue: 'text-[#007373] break-words',
  booleanValue: 'text-[#ce921a]',
  numberValue: 'text-[#8a4db2] font-medium',
};

const customDarkStyles = {
  ...darkStyles,
  container: 'bg-secondary m-3 p-3 rounded-lg',
  label: 'text-primary',
  nullValue: 'text-[#00b3ff]',
  stringValue: 'text-[#00dcdc] break-words',
  booleanValue: 'text-[#eab305]',
  numberValue: 'text-[#dd8cff] font-medium',
};

export default function JsonViewer({ json }: JsonViewerProps) {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? customDarkStyles : customLightStyles;
  return <JsonView data={json} shouldExpandNode={allExpanded} style={styles} />;
}
