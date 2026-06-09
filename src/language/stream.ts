import type { LanguageModelV3FinishReason, LanguageModelV3StreamPart } from '@ai-sdk/provider';
import { convertArrayToReadableStream, convertReadableStreamToArray } from '@ai-sdk/provider-utils/test';
import { simulateReadableStream } from 'ai';

/** Simulated timing for a stream. Shared by `Stream.simulate`, `MockLanguageModel.streamResult`, and the `stream` chunks form. */
export type StreamDelayOptions = {
  /** Delay before the first part is emitted. */
  initialDelayInMs?: number;
  /** Delay between each subsequent part. */
  chunkDelayInMs?: number;
};

/** Operations for building, draining, and inspecting language model streams in tests. */
export const Stream = {
  /** Builds a `ReadableStream` from an array of parts. */
  from: <PART>(parts: Array<PART>): ReadableStream<PART> => convertArrayToReadableStream(parts),

  /** Builds a `ReadableStream` that emits parts with optional delays, for timing tests. */
  simulate: <PART>(chunks: Array<PART>, opts: StreamDelayOptions = {}): ReadableStream<PART> =>
    simulateReadableStream({ chunks, ...opts }),

  /** Reads a stream to completion and returns every part it emitted. */
  toArray: <PART>(stream: ReadableStream<PART>): Promise<Array<PART>> => convertReadableStreamToArray(stream),

  /** Joins the `text-delta` parts of a stream-part sequence into the full text. */
  text: (parts: Array<LanguageModelV3StreamPart>): string =>
    parts
      .filter((part): part is Extract<LanguageModelV3StreamPart, { type: 'text-delta' }> => part.type === 'text-delta')
      .map((part) => part.delta)
      .join(''),

  /** Returns the finish reason from a stream-part sequence, if a `finish` part is present. */
  finishReason: (parts: Array<LanguageModelV3StreamPart>): LanguageModelV3FinishReason | undefined =>
    parts.find((part): part is Extract<LanguageModelV3StreamPart, { type: 'finish' }> => part.type === 'finish')
      ?.finishReason,
};
