// Flat ESLint config aligned with Next.js 15
import next from 'eslint-config-next';

export default [
  ...next,
  {
    rules: {
      // Relax noisy rules for this project setup
      'react/no-unescaped-entities': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      '@next/next/no-page-custom-font': 'off',
    },
  },
];
