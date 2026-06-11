import type { UIDataTypes, UIMessage, UITools } from 'ai';
import { createUIChunks } from './chunks.js';
import { createUIMessages } from './message.js';
import { createUIParts } from './parts.js';

/** Extracts the `METADATA` type parameter from a `UIMessage` type. */
type MetadataOf<UI_MESSAGE> = UI_MESSAGE extends UIMessage<infer METADATA, UIDataTypes, UITools> ? METADATA : unknown;
/** Extracts the `DATA` type parameter from a `UIMessage` type. */
type DataOf<UI_MESSAGE> = UI_MESSAGE extends UIMessage<unknown, infer DATA, UITools> ? DATA : UIDataTypes;
/** Extracts the `TOOLS` type parameter from a `UIMessage` type. */
type ToolsOf<UI_MESSAGE> = UI_MESSAGE extends UIMessage<unknown, UIDataTypes, infer TOOLS> ? TOOLS : UITools;

/**
 * Binds the UI builders to a concrete `UIMessage` type, so `data`/`tool`/`messageMetadata` and message
 * metadata infer their names and payloads from that type. Returns typed `UIParts`, `UIChunks`, and
 * `UIMessages` namespaces; for loose, untyped builders use the top-level exports instead.
 *
 * @example
 * const { UIParts, UIChunks, UIMessages } = fromUIMessage<MyUIMessage>();
 * UIChunks.data('weather', { city: 'Tokyo' }); // name and payload typed
 * UIMessages.assistant([UIParts.text('hi')]);
 */
export const fromUIMessage = <UI_MESSAGE extends UIMessage>(): {
  UIParts: ReturnType<typeof createUIParts<DataOf<UI_MESSAGE>, ToolsOf<UI_MESSAGE>>>;
  UIChunks: ReturnType<typeof createUIChunks<MetadataOf<UI_MESSAGE>, DataOf<UI_MESSAGE>>>;
  UIMessages: ReturnType<typeof createUIMessages<MetadataOf<UI_MESSAGE>, DataOf<UI_MESSAGE>, ToolsOf<UI_MESSAGE>>>;
} => ({
  UIParts: createUIParts<DataOf<UI_MESSAGE>, ToolsOf<UI_MESSAGE>>(),
  UIChunks: createUIChunks<MetadataOf<UI_MESSAGE>, DataOf<UI_MESSAGE>>(),
  UIMessages: createUIMessages<MetadataOf<UI_MESSAGE>, DataOf<UI_MESSAGE>, ToolsOf<UI_MESSAGE>>(),
});
