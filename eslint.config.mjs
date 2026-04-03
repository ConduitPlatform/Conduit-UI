import coreWebVitals from 'eslint-config-next/core-web-vitals';

/**
 * Incremental tightening: try turning individual rules below from "off" to "warn"
 * or "error" and fix files in small PRs (react-hooks/* from eslint-plugin-react-hooks v7).
 */
/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
    ],
  },
  ...coreWebVitals,
  {
    rules: {
      'react/jsx-key': [1, { checkFragmentShorthand: true }],
      'import/no-anonymous-default-export': 'off',
      // React Compiler / hooks rules — re-enable incrementally (see comment at top)
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/static-components': 'off',
      // Re-enabled: catches accidental `module =` in app code; fix any violations if reported
      '@next/next/no-assign-module-variable': 'error',
    },
  },
];

export default eslintConfig;
