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
  container: `${defaultStyles.container} semantic-json-view m-3 rounded-lg p-3`,
  label: `${defaultStyles.label} semantic-json-view__property`,
  clickableLabel: `${defaultStyles.clickableLabel} semantic-json-view__property`,
  nullValue: `${defaultStyles.nullValue} semantic-json-view__null`,
  undefinedValue: `${defaultStyles.undefinedValue} semantic-json-view__null`,
  stringValue: `${defaultStyles.stringValue} semantic-json-view__string wrap-break-word`,
  booleanValue: `${defaultStyles.booleanValue} semantic-json-view__boolean`,
  numberValue: `${defaultStyles.numberValue} semantic-json-view__number font-medium`,
  otherValue: `${defaultStyles.otherValue} semantic-json-view__value`,
  punctuation: `${defaultStyles.punctuation} semantic-json-view__punctuation`,
  expandIcon: `${defaultStyles.expandIcon} semantic-json-view__control`,
  collapseIcon: `${defaultStyles.collapseIcon} semantic-json-view__control`,
  collapsedContent: `${defaultStyles.collapsedContent} semantic-json-view__collapsed`,
};

const customDarkStyles = {
  ...darkStyles,
  container: `${darkStyles.container} semantic-json-view m-3 rounded-lg p-3`,
  label: `${darkStyles.label} semantic-json-view__property`,
  clickableLabel: `${darkStyles.clickableLabel} semantic-json-view__property`,
  nullValue: `${darkStyles.nullValue} semantic-json-view__null`,
  undefinedValue: `${darkStyles.undefinedValue} semantic-json-view__null`,
  stringValue: `${darkStyles.stringValue} semantic-json-view__string wrap-break-word`,
  booleanValue: `${darkStyles.booleanValue} semantic-json-view__boolean`,
  numberValue: `${darkStyles.numberValue} semantic-json-view__number font-medium`,
  otherValue: `${darkStyles.otherValue} semantic-json-view__value`,
  punctuation: `${darkStyles.punctuation} semantic-json-view__punctuation`,
  expandIcon: `${darkStyles.expandIcon} semantic-json-view__control`,
  collapseIcon: `${darkStyles.collapseIcon} semantic-json-view__control`,
  collapsedContent: `${darkStyles.collapsedContent} semantic-json-view__collapsed`,
};

export default function JsonViewer({ json }: JsonViewerProps) {
  const { resolvedTheme } = useTheme();
  const styles =
    resolvedTheme === 'dark' ? customDarkStyles : customLightStyles;
  return <JsonView data={json} shouldExpandNode={allExpanded} style={styles} />;
}
