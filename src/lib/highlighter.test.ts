import { describe, expect, it } from 'vitest';
import { highlightCode } from '@/lib/highlighter';

describe(highlightCode, () => {
  it('recognizes a language alias regardless of case', async () => {
    await expect(highlightCode('const n = 2;\nn + 1;', 'JS')).resolves.toHaveLength(2);
  });

  it('returns null for an inherited object key', async () => {
    await expect(highlightCode('text', 'constructor')).resolves.toBeNull();
  });
});
