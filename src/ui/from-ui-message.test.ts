import type { UIMessage } from 'ai';
import { describe, expect, expectTypeOf, test } from 'vitest';
import { fromUIMessage } from './from-ui-message.js';

/** A concrete message type used to drive inference in these tests. */
type MyUIMessage = UIMessage<
  { traceId: string },
  { weather: { city: string } },
  { search: { input: { q: string }; output: { hits: number } } }
>;

describe('fromUIMessage', () => {
  test('should bind data builders to the message data types', () => {
    // Arrange
    const { UIParts, UIChunks } = fromUIMessage<MyUIMessage>();

    // Act
    const part = UIParts.data('weather', { city: 'Tokyo' });
    const chunk = UIChunks.data('weather', { city: 'Tokyo' });

    // Assert
    expect(part).toEqual({ type: 'data-weather', data: { city: 'Tokyo' } });
    expect(chunk).toEqual({ type: 'data-weather', data: { city: 'Tokyo' } });
    expectTypeOf(UIParts.data).parameter(1).toEqualTypeOf<{ city: string }>();
  });

  test('should bind metadata builders to the message metadata type', () => {
    // Arrange
    const { UIChunks, UIMessages } = fromUIMessage<MyUIMessage>();

    // Act
    const chunk = UIChunks.messageMetadata({ traceId: 't1' });
    const message = UIMessages.assistant('hi', { id: 'm1', metadata: { traceId: 't1' } });

    // Assert
    expect(chunk).toEqual({ type: 'message-metadata', messageMetadata: { traceId: 't1' } });
    expect(message.metadata).toEqual({ traceId: 't1' });
    expectTypeOf(UIChunks.messageMetadata).parameter(0).toEqualTypeOf<{ traceId: string }>();
  });

  test('should bind tool parts to the message tool set', () => {
    // Arrange
    const { UIParts } = fromUIMessage<MyUIMessage>();

    // Act
    const part = UIParts.tool('search', {
      toolCallId: 'call-1',
      state: 'output-available',
      input: { q: 'cats' },
      output: { hits: 3 },
    });

    // Assert
    expect(part).toEqual({
      type: 'tool-search',
      toolCallId: 'call-1',
      state: 'output-available',
      input: { q: 'cats' },
      output: { hits: 3 },
    });
  });
});
