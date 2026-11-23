import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Reusable UI exports can be consumed individually. The Shadcn CLI resolves its
  // utility entry through components.json rather than a static import.
  entry: [
    'src/components/ui/*.tsx',
    'src/hooks/*.ts',
    'src/components/LocaleSwitcher.tsx',
    'src/lib/utils.ts',
  ],
  // Files to exclude from Knip analysis
  ignore: ['src/libs/I18n.ts', 'src/types/I18n.ts'],
  // Dependencies to ignore during analysis

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
