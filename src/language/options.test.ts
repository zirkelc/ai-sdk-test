import { describe, expect, test } from 'vitest';
import { Options } from './options.js';

describe('Options', () => {
  test('generateId() should return a stable id', () => {
    // Assert
    expect(Options.generateId()).toBe('aitxt-mock-id');
  });

  test('generate should carry a deterministic generateId', () => {
    // Assert
    expect(Options.generate._internal?.generateId?.()).toBe('aitxt-mock-id');
  });

  test('stream should carry a deterministic generateId and now', () => {
    // Assert
    expect(Options.stream._internal?.generateId?.()).toBe('aitxt-mock-id');
    expect(Options.stream._internal?.now?.()).toBe(0);
  });
});
