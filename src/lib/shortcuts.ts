export interface Shortcut {
  key: string;
  label: string;
  description: string;
  group: string;
}

export const SHORTCUTS: Shortcut[] = [
  {
    key: 'K',
    label: 'K',
    description: 'Open command palette',
    group: 'Navigation',
  },
  {
    key: 'B',
    label: 'B',
    description: 'Toggle sidebar',
    group: 'Navigation',
  },
  {
    key: '/',
    label: '/',
    description: 'Show keyboard shortcuts',
    group: 'Navigation',
  },
  {
    key: 'Escape',
    label: 'Esc',
    description: 'Close current overlay',
    group: 'General',
  },
  {
    key: 'Enter',
    label: '↵',
    description: 'Confirm primary action',
    group: 'General',
  },
  {
    key: 'Backspace',
    label: '⌫',
    description: 'Delete selected item',
    group: 'Actions',
  },
];

export function groupShortcuts(
  shortcuts: Shortcut[]
): Record<string, Shortcut[]> {
  return shortcuts.reduce(
    (acc, shortcut) => {
      const group = shortcut.group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );
}
