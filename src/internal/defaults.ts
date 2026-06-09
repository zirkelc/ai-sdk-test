import type { LanguageModelV3FinishReason, LanguageModelV3Usage } from '@ai-sdk/provider';

/** Standard "stop" finish reason used when none is supplied. */
export const defaultFinishReason: LanguageModelV3FinishReason = {
  unified: 'stop',
  raw: 'stop',
};

/** Small, stable token usage used when none is supplied. */
export const defaultUsage: LanguageModelV3Usage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 20, text: 20, reasoning: 0 },
};

/** Normalizes a finish reason: a bare unified value becomes `{ unified, raw }`; an object passes through. */
export const toFinishReason = (
  reason: LanguageModelV3FinishReason | LanguageModelV3FinishReason['unified'],
): LanguageModelV3FinishReason => (typeof reason === 'string' ? { unified: reason, raw: reason } : reason);
