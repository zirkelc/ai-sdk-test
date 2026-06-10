import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from 'ai';

/** Monotonic counter backing the auto-generated message ids. */
let messageCounter = 0;
/** Returns the next unique auto-generated message id. */
const nextMessageId = (): string => {
  messageCounter += 1;
  return `mock-message-${messageCounter}`;
};

/** Identity and metadata overrides for a built message. */
type MessageOptions<METADATA> = {
  /** The message id; defaults to an auto-incrementing `mock-message-{n}`. */
  id?: string;
  /** Typed message metadata. */
  metadata?: METADATA;
};

/**
 * Builds the {@link UIMessages} namespace bound to a message's `METADATA`, `DATA`, and `TOOLS` types.
 * Each role helper accepts a `string` shortcut (becomes a single text part) or a full array of parts.
 * Use the top-level {@link UIMessages} for the loose default, or `fromUIMessage` to bind.
 */
export const createUIMessages = <
  METADATA = unknown,
  DATA extends UIDataTypes = UIDataTypes,
  TOOLS extends UITools = UITools,
>() => {
  /** Normalizes a string shortcut into a single text part, or passes an array of parts through. */
  const toParts = (content: string | Array<UIMessagePart<DATA, TOOLS>>): Array<UIMessagePart<DATA, TOOLS>> =>
    typeof content === 'string' ? [{ type: 'text', text: content }] : content;

  /** Assembles a message of the given role from content and options. */
  const build = (
    role: UIMessage<METADATA, DATA, TOOLS>['role'],
    content: string | Array<UIMessagePart<DATA, TOOLS>>,
    opts: MessageOptions<METADATA>,
  ): UIMessage<METADATA, DATA, TOOLS> => ({
    id: opts.id ?? nextMessageId(),
    role,
    parts: toParts(content),
    ...(opts.metadata !== undefined ? { metadata: opts.metadata } : {}),
  });

  return {
    /** A `user` message from a text shortcut or an array of parts. */
    user: (
      content: string | Array<UIMessagePart<DATA, TOOLS>>,
      opts: MessageOptions<METADATA> = {},
    ): UIMessage<METADATA, DATA, TOOLS> => build('user', content, opts),

    /** An `assistant` message from a text shortcut or an array of parts. */
    assistant: (
      content: string | Array<UIMessagePart<DATA, TOOLS>>,
      opts: MessageOptions<METADATA> = {},
    ): UIMessage<METADATA, DATA, TOOLS> => build('assistant', content, opts),

    /** A `system` message from a text shortcut or an array of parts. */
    system: (
      content: string | Array<UIMessagePart<DATA, TOOLS>>,
      opts: MessageOptions<METADATA> = {},
    ): UIMessage<METADATA, DATA, TOOLS> => build('system', content, opts),
  };
};

/** Builders for `UIMessage`s, with loose default types. Use `fromUIMessage` to bind to a message type. */
export const UIMessages = createUIMessages();
