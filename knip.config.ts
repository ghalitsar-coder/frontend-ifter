import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Files to exclude from Knip analysis
  ignore: [
    'src/libs/I18n.ts',
    'src/types/I18n.ts',
    // Wave-2 integration layers: public API surface of the generated-style
    // data client (query keys, options hooks, DTO types, mock fixtures).
    // Not all exports are consumed yet; deleting them would shrink the
    // contract surface against the backend, so knip only reports on them.
    'src/lib/api/**',
    'src/data/**',
    'src/types/**',
  ],
  // Dependencies to ignore during analysis
  ignoreDependencies: [],
  // Include custom Playwright test file suffixes
  playwright: {
    entry: ['tests/**/*.@(integ|e2e).ts'],
  },
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/gu)].join('\n'),
  },
  treatConfigHintsAsErrors: true,
};

export default config;
