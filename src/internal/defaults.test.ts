import { describe, expect, test } from 'vitest';
import { defaultFinishReason, defaultUsage } from './defaults.js';

describe('defaults', () => {
  test('defaultFinishReason should be a unified stop', () => {
    // Assert
    expect(defaultFinishReason).toEqual({ unified: 'stop', raw: 'stop' });
  });

  test('defaultUsage should report stable token totals', () => {
    // Assert
    expect(defaultUsage.inputTokens.total).toBe(10);
    expect(defaultUsage.outputTokens.total).toBe(20);
  });
});
