import { describe, expect, test } from 'vitest';
import { createUIMessages, UIMessages } from './message.js';
import { UIParts } from './parts.js';

describe('UIMessages', () => {
  test('user() should turn a string shortcut into a single text part', () => {
    // Act
    const message = UIMessages.user('hi', { id: 'm1' });

    // Assert
    expect(message).toEqual({ id: 'm1', role: 'user', parts: [{ type: 'text', text: 'hi' }] });
  });

  test('assistant() should pass an array of parts through', () => {
    // Arrange
    const parts = [UIParts.text('a'), UIParts.reasoning('b')];

    // Act
    const message = UIMessages.assistant(parts, { id: 'm1' });

    // Assert
    expect(message).toEqual({ id: 'm1', role: 'assistant', parts });
  });

  test('system() should build a system message', () => {
    // Act
    const message = UIMessages.system('be nice', { id: 'm1' });

    // Assert
    expect(message.role).toBe('system');
  });

  test('should include metadata when provided', () => {
    // Arrange
    const ui = createUIMessages<{ traceId: string }>();

    // Act
    const message = ui.user('hi', { id: 'm1', metadata: { traceId: 't1' } });

    // Assert
    expect(message.metadata).toEqual({ traceId: 't1' });
  });

  test('should auto-generate a stable, incrementing id when none is given', () => {
    // Act
    const first = UIMessages.user('a');
    const second = UIMessages.user('b');

    // Assert
    expect(first.id).toBe('mock-message-1');
    expect(second.id).toBe('mock-message-2');
  });
});
