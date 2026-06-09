import { describe, expect, test } from 'vitest';
import * as root from './index.js';

describe('root barrel', () => {
  test('should be intentionally empty (import from subpaths like ai-test-kit/language)', () => {
    // Assert
    expect(Object.keys(root).length).toBe(0);
  });
});
