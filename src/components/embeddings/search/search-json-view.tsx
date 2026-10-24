'use client';

import { useTheme } from 'next-themes';
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { SemanticSearchHit } from '@/lib/models/embeddings/search';

function jsonViewStyles(base: typeof defaultStyles) {
  return {
    ...base,
    container: `${base.container} semantic-json-view font-mono text-sm`,
    label: `${base.label} semantic-json-view__property`,
    clickableLabel: `${base.clickableLabel} semantic-json-view__property`,
    nullValue: `${base.nullValue} semantic-json-view__null`,
    undefinedValue: `${base.undefinedValue} semantic-json-view__null`,
    stringValue: `${base.stringValue} semantic-json-view__string wrap-break-word`,
    booleanValue: `${base.booleanValue} semantic-json-view__boolean`,
    numberValue: `${base.numberValue} semantic-json-view__number font-medium`,
    otherValue: `${base.otherValue} semantic-json-view__value`,
    punctuation: `${base.punctuation} semantic-json-view__punctuation`,
    expandIcon: `${base.expandIcon} semantic-json-view__control`,
    collapseIcon: `${base.collapseIcon} semantic-json-view__control`,
    collapsedContent: `${base.collapsedContent} semantic-json-view__collapsed`,
  };
}

type SearchJsonViewProps = {
  hits: SemanticSearchHit[];
};

export function SearchJsonView({ hits }: SearchJsonViewProps) {
  const { resolvedTheme } = useTheme();
  const jsonStyles = jsonViewStyles(
    resolvedTheme === 'dark' ? darkStyles : defaultStyles
  );

  return (
    <div className="overflow-auto rounded-md border border-border/60 bg-surface-2 p-3">
      <JsonView
        data={hits}
        shouldExpandNode={level => level < 2}
        style={jsonStyles}
      />
    </div>
  );
}
