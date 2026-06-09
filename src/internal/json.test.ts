import { describe, expect, test } from 'vitest';
import { toJSONString } from './json.js';

describe('toJSONString', () => {
  test('should pass a string through unchanged', () => {
    // Act
    const result = toJSONString('already json');

    // Assert
    expect(result).toBe('already json');
  });

  test('should stringify a non-string value', () => {
    // Act
    const result = toJSONString({ city: 'Tokyo' });

    // Assert
    expect(result).toBe('{"city":"Tokyo"}');
  });
});
