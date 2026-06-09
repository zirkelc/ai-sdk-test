import { describe, expect, test } from 'vitest';
import { tokenize } from './tokenize.js';

describe('tokenize', () => {
  test('should return the whole string as one token with no strategy', () => {
    // Act
    const tokens = tokenize('Hello World');

    // Assert
    expect(tokens).toEqual(['Hello World']);
  });

  test('should split into fixed-length slices', () => {
    // Act
    const tokens = tokenize('abcde', { length: 2 });

    // Assert
    expect(tokens).toEqual(['ab', 'cd', 'e']);
  });

  test('should split on a separator and re-append it to each token', () => {
    // Act
    const tokens = tokenize('a,b,c', { separator: ',' });

    // Assert
    expect(tokens).toEqual(['a,', 'b,', 'c,']);
  });

  test('should prefer separator over length when both are given', () => {
    // Act
    const tokens = tokenize('a b', { length: 1, separator: ' ' });

    // Assert
    expect(tokens).toEqual(['a ', 'b ']);
  });
});
