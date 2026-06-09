import { describe, expect, test } from 'vitest';
import { Content } from './content.js';

describe('Content', () => {
  test('text() should build a text part', () => {
    // Act
    const part = Content.text('hi');

    // Assert
    expect(part).toEqual({ type: 'text', text: 'hi' });
  });

  test('reasoning() should build a reasoning part', () => {
    // Act
    const part = Content.reasoning('thinking');

    // Assert
    expect(part).toEqual({ type: 'reasoning', text: 'thinking' });
  });

  test('toolCall() should stringify object input to JSON', () => {
    // Act
    const part = Content.toolCall({ toolCallId: '1', toolName: 'weather', input: { city: 'Tokyo' } });

    // Assert
    expect(part).toEqual({ type: 'tool-call', toolCallId: '1', toolName: 'weather', input: '{"city":"Tokyo"}' });
  });

  test('toolCall() should pass string input through', () => {
    // Act
    const part = Content.toolCall({ toolCallId: '1', toolName: 'weather', input: '{"city":"Tokyo"}' });

    // Assert
    expect(part.input).toBe('{"city":"Tokyo"}');
  });

  test('toolResult() should omit isError when not provided', () => {
    // Act
    const part = Content.toolResult({ toolCallId: '1', toolName: 'weather', result: { temp: 20 } });

    // Assert
    expect(part).toEqual({ type: 'tool-result', toolCallId: '1', toolName: 'weather', result: { temp: 20 } });
  });

  test('toolResult() should include isError when provided', () => {
    // Act
    const part = Content.toolResult({ toolCallId: '1', toolName: 'weather', result: 'nope', isError: true });

    // Assert
    expect(part.isError).toBe(true);
  });

  test('file() should build a file part', () => {
    // Act
    const part = Content.file({ mediaType: 'image/png', data: 'abc' });

    // Assert
    expect(part).toEqual({ type: 'file', mediaType: 'image/png', data: 'abc' });
  });

  test('source() should build a url source, omitting title when absent', () => {
    // Act
    const part = Content.source({ id: 's1', url: 'https://example.com' });

    // Assert
    expect(part).toEqual({ type: 'source', sourceType: 'url', id: 's1', url: 'https://example.com' });
  });

  test('source() should include title when provided', () => {
    // Act
    const part = Content.source({ id: 's1', url: 'https://example.com', title: 'Example' });

    // Assert
    expect(part).toEqual({ type: 'source', sourceType: 'url', id: 's1', url: 'https://example.com', title: 'Example' });
  });
});
