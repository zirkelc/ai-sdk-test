import type { UIMessage } from 'ai';
import { fromUIMessage } from 'ai-test-kit/ui';
import { describe, expectTypeOf, test } from 'vitest';

/**
 * Regression test for the bound builders' emitted argument types.
 *
 * This imports from the published entry (`ai-test-kit/ui` → built `.d.mts`) on purpose: the defect
 * it guards only surfaces in the bundled declarations, where `fromUIMessage`'s return type used to
 * be inlined by expanding the generic `Omit<Extract<…>>` argument shapes into a non-homomorphic
 * distribution that dropped every optional modifier. A `*.test-d.ts` compiled against `src` sees
 * the correct source types and cannot catch it, so this file lives in `test-d/` and is type-checked
 * by `pnpm test:types` after a build.
 */
type MyUIMessage = UIMessage<{ id: string }, { weather: { x: number } }, never>;

describe('fromUIMessage bound builders (built types)', () => {
  const { UIParts, UIChunks } = fromUIMessage<MyUIMessage>();

  test('should keep optional chunk fields optional', () => {
    // `providerMetadata` is optional on these chunks, so the id alone must suffice.
    expectTypeOf(UIChunks.textStart).toBeCallableWith({ id: '1' });
    expectTypeOf(UIChunks.textDelta).toBeCallableWith({ id: '1', delta: 'x' });
    expectTypeOf(UIChunks.reasoningStart).toBeCallableWith({ id: '1' });
  });

  test('should keep optional part fields optional', () => {
    // Every field but the source identity is optional here.
    expectTypeOf(UIParts.text).toBeCallableWith('hi');
    expectTypeOf(UIParts.file).toBeCallableWith({ mediaType: 'image/png', url: 'https://x' });
    expectTypeOf(UIParts.sourceUrl).toBeCallableWith({ sourceId: 's', url: 'https://x' });
  });

  test('should still bind data and tool builders to the message types', () => {
    expectTypeOf(UIChunks.data).toBeCallableWith('weather', { x: 1 });
    expectTypeOf(UIParts.data).toBeCallableWith('weather', { x: 1 });
  });
});
