import type { generateText, streamText } from 'ai';

/** Deterministic id generator so generated message ids are stable across runs. */
const generateId = (): string => 'aitxt-mock-id';

/**
 * Determinism helpers to spread into `generateText`/`streamText` so ids and timestamps are stable.
 *
 * Note: `Options.stream` sets `_internal.now` to control timestamps, but the AI SDK has a bug where
 * the `finish-step` response timestamp in the error streaming path uses `new Date()` directly. Tests
 * that hit that path additionally need `vi.useFakeTimers()`.
 *
 * @example
 * await generateText({ model, prompt: 'x', ...Options.generate });
 * streamText({ model, prompt: 'x', ...Options.stream });
 */
export const Options = {
  /** Stable id generator used by `Options.generate` / `Options.stream`. */
  generateId,

  /** Spread into `generateText` for a deterministic `generateId`. */
  generate: { _internal: { generateId } } satisfies Pick<Parameters<typeof generateText>[0], '_internal'>,

  /** Spread into `streamText` for a deterministic `generateId` and `now`. */
  stream: { _internal: { generateId, now: () => 0 } } satisfies Pick<Parameters<typeof streamText>[0], '_internal'>,
};
