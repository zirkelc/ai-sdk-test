import { describe, expect, test } from 'vitest';
import { StreamParts } from './stream-parts.js';

describe('StreamParts', () => {
  test('text() should build a start/delta/end block without finish', () => {
    // Act
    const parts = StreamParts.text('ab', { length: 1 });

    // Assert
    expect(parts).toEqual([
      { type: 'text-start', id: '1' },
      { type: 'text-delta', id: '1', delta: 'a' },
      { type: 'text-delta', id: '1', delta: 'b' },
      { type: 'text-end', id: '1' },
    ]);
  });

  test('text() should honor a custom id', () => {
    // Act
    const parts = StreamParts.text('x', { id: 'abc' });

    // Assert
    expect(parts[0]).toEqual({ type: 'text-start', id: 'abc' });
  });

  test('reasoning() should build a reasoning block', () => {
    // Act
    const parts = StreamParts.reasoning('hm');

    // Assert
    expect(parts).toEqual([
      { type: 'reasoning-start', id: '1' },
      { type: 'reasoning-delta', id: '1', delta: 'hm' },
      { type: 'reasoning-end', id: '1' },
    ]);
  });

  test('toolInput() should stream stringified input between start and end', () => {
    // Act
    const parts = StreamParts.toolInput({ id: 't1', toolName: 'weather', input: { city: 'Tokyo' } });

    // Assert
    expect(parts).toEqual([
      { type: 'tool-input-start', id: 't1', toolName: 'weather' },
      { type: 'tool-input-delta', id: 't1', delta: '{"city":"Tokyo"}' },
      { type: 'tool-input-end', id: 't1' },
    ]);
  });

  test('toolCall() should produce the same shape as the content part', () => {
    // Act
    const part = StreamParts.toolCall({ toolCallId: '1', toolName: 'weather', input: { city: 'Tokyo' } });

    // Assert
    expect(part).toEqual({ type: 'tool-call', toolCallId: '1', toolName: 'weather', input: '{"city":"Tokyo"}' });
  });

  test('finish() should default usage and finish reason', () => {
    // Act
    const part = StreamParts.finish();

    // Assert
    expect(part).toMatchObject({ type: 'finish', finishReason: { unified: 'stop', raw: 'stop' } });
  });

  test('finish() should accept a unified finish reason string', () => {
    // Act
    const part = StreamParts.finish({ finishReason: 'length' });

    // Assert
    expect(part).toMatchObject({ type: 'finish', finishReason: { unified: 'length', raw: 'length' } });
  });

  test('finish() should accept a full finish reason object', () => {
    // Act
    const part = StreamParts.finish({ finishReason: { unified: 'tool-calls', raw: 'tool_use' } });

    // Assert
    expect(part).toMatchObject({ type: 'finish', finishReason: { unified: 'tool-calls', raw: 'tool_use' } });
  });

  test('error() should build an error part', () => {
    // Arrange
    const cause = new Error('mid-stream');

    // Act
    const part = StreamParts.error(cause);

    // Assert
    expect(part).toEqual({ type: 'error', error: cause });
  });

  test('streamStart() should default warnings to an empty array', () => {
    // Act
    const part = StreamParts.streamStart();

    // Assert
    expect(part).toEqual({ type: 'stream-start', warnings: [] });
  });

  test('raw() should wrap a raw value', () => {
    // Act
    const part = StreamParts.raw({ any: 'thing' });

    // Assert
    expect(part).toEqual({ type: 'raw', rawValue: { any: 'thing' } });
  });
});
