import { describe, expect, test } from 'vitest';
import { Stream } from './stream.js';
import { StreamParts } from './stream-parts.js';

describe('Stream', () => {
  test('text() should join text-delta parts', () => {
    // Arrange
    const parts = StreamParts.text('Hello World');

    // Act
    const text = Stream.text(parts);

    // Assert
    expect(text).toBe('Hello World');
  });

  test('finishReason() should read the finish part', () => {
    // Arrange
    const parts = [...StreamParts.text('hi'), StreamParts.finish({ finishReason: 'length' })];

    // Act
    const reason = Stream.finishReason(parts);

    // Assert
    expect(reason).toEqual({ unified: 'length', raw: 'length' });
  });

  test('finishReason() should be undefined without a finish part', () => {
    // Act
    const reason = Stream.finishReason(StreamParts.text('hi'));

    // Assert
    expect(reason).toBe(undefined);
  });

  test('from() and toArray() should round-trip parts', async () => {
    // Arrange
    const parts = StreamParts.text('round');

    // Act
    const roundTripped = await Stream.toArray(Stream.from(parts));

    // Assert
    expect(roundTripped).toEqual(parts);
  });

  test('simulate() should drain to the provided chunks', async () => {
    // Arrange
    const parts = StreamParts.text('sim');

    // Act
    const drained = await Stream.toArray(Stream.simulate(parts));

    // Assert
    expect(drained).toEqual(parts);
  });
});
