# ai-test-kit

<p align="center">Test utilities for the AI SDK: mock models, content and stream-part builders, fully type-safe</p>
<p align="center">
  <a href="https://www.npmjs.com/package/ai-test-kit" alt="ai-test-kit"><img src="https://img.shields.io/npm/dt/ai-test-kit?label=ai-test-kit"></a> <a href="https://github.com/zirkelc/ai-test-kit/actions/workflows/ci.yml" alt="CI"><img src="https://img.shields.io/github/actions/workflow/status/zirkelc/ai-test-kit/ci.yml?branch=main"></a>
</p>

This library provides ergonomic, type-safe helpers for testing code built on the AI SDK. It wraps the low-level mocks from [`ai/test`](https://ai-sdk.dev/docs/ai-sdk-core/testing) with a fluent API to mock [`generateText()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text) / [`streamText()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text), build content and stream parts, and assert on results.

### Why?

The AI SDK ships `MockLanguageModelV3` and other helpers under `ai/test`, but they are deliberately low-level. In practice every project ends up rebuilding the same helpers to:

- **Mock a model**: return text, throw an error, or replay a scripted response per call
- **Build content and stream parts**: assemble valid `text-start` → `text-delta` → `text-end` → `finish` streams by hand
- **Keep tests deterministic**: pin message ids and timestamps so snapshots are stable

This library provides those helpers as small, composable builders. Models are `vi.fn()` spies, so you can assert on calls with the full Vitest API while also reading the recorded call arguments directly.

Model families live under their own entry points (`ai-test-kit/language`, and later `ai-test-kit/embedding`, `ai-test-kit/image`), so each import only pulls in the types for that model.

### Installation

```bash
npm install -D ai-test-kit
```

`ai` and `vitest` are peer dependencies.

## Usage

### Creating a Mock Model

Pass a response to `MockLanguageModel()`. A `string` is the common case: it serves both `doGenerate` and `doStream`.

```typescript
import { generateText } from 'ai';
import { MockLanguageModel } from 'ai-test-kit/language';

const model = MockLanguageModel('Hello, world!');

const result = await generateText({ model, prompt: 'Hi' });
result.text; // 'Hello, world!'
```

### Generate and Stream

The same model answers both `generateText()` and `streamText()`. For streaming, a string is assembled into a `stream-start` → text → `finish` sequence.

```typescript
import { streamText } from 'ai';
import { MockLanguageModel, Stream } from 'ai-test-kit/language';

const model = MockLanguageModel('Hello World');

const result = streamText({ model, prompt: 'Hi' });
const text = (await Stream.toArray(result.textStream)).join(''); // 'Hello World'
```

### Throwing Errors

Pass an `Error` to make the model throw, for testing error handling and retries.

```typescript
const model = MockLanguageModel(new Error('rate limited'));

await expect(generateText({ model, prompt: 'Hi' })).rejects.toThrow();
```

### Sequenced Responses

Pass an array to script a response per call. The model advances through the array and clamps to the last entry once exhausted, ideal for retry and fallback tests. An array models the sequence directly and is easy to build programmatically.

```typescript
// fail, fail, then succeed
const model = MockLanguageModel([new Error('429'), new Error('429'), 'recovered']);

await generateText({ model, prompt: 'Hi' }).catch(() => {});
await generateText({ model, prompt: 'Hi' }).catch(() => {});
const result = await generateText({ model, prompt: 'Hi' });
result.text; // 'recovered'
```

### Building Content

Use `Content` to assemble the parts a model returns from `doGenerate`. Pass them via the `content` response form. Like a plain `string`, a `{ content }` mock also serves `streamText()` — the stream is derived from the parts.

```typescript
import { Content, MockLanguageModel } from 'ai-test-kit/language';

const model = MockLanguageModel({
  content: [
    Content.text('Here is the weather:'),
    Content.toolCall({ toolCallId: 'call-1', toolName: 'weather', input: { city: 'Tokyo' } }),
  ],
});

const result = await generateText({ model, prompt: 'Weather in Tokyo?' });
result.toolCalls[0].toolName; // 'weather'
```

### Building Streams

Use `StreamParts` to compose a stream from atoms. The text-like builders return a `start` / `delta` / `end` block (no trailing `finish`), so streams compose by concatenation.

```typescript
import { MockLanguageModel, StreamParts } from 'ai-test-kit/language';

const model = MockLanguageModel({
  stream: [
    StreamParts.streamStart(),
    ...StreamParts.text('Hello', { length: 1 }), // emit one character per delta
    ...StreamParts.toolInput({ id: 't1', toolName: 'weather', input: { city: 'Tokyo' } }),
    StreamParts.toolCall({ toolCallId: 'call-1', toolName: 'weather', input: { city: 'Tokyo' } }),
    StreamParts.finish(),
  ],
});
```

For timing tests, give the `stream` form a `{ chunks, ... }` object with delays (or use `Stream.simulate`):

```typescript
const model = MockLanguageModel({
  stream: {
    chunks: [...StreamParts.text('slow'), StreamParts.finish()],
    initialDelayInMs: 10,
    chunkDelayInMs: 5,
  },
});
```

### Different Responses per Method

Use the `{ generate, stream }` form to drive `doGenerate` and `doStream` independently — for example to return plain text non-streaming but a richer sequence when streamed.

```typescript
import { MockLanguageModel, StreamParts } from 'ai-test-kit/language';

const model = MockLanguageModel({
  generate: 'Final answer',
  stream: [...StreamParts.text('Final answer'), StreamParts.finish()],
});
```

### Inspecting Streams

Use `Stream` to build, drain, and read stream parts when asserting.

```typescript
import { Stream, StreamParts } from 'ai-test-kit/language';

const parts = [...StreamParts.text('Hello World'), StreamParts.finish()];

Stream.text(parts); // 'Hello World'
Stream.finishReason(parts)?.unified; // 'stop'

const drained = await Stream.toArray(Stream.from(parts)); // round-trips parts
```

### Deterministic Output

`generateText()` / `streamText()` assign a random `response.id` and a wall-clock `response.timestamp`. When a test asserts on those (e.g. snapshots), spread `Options` to pin them. It is not needed for ordinary assertions like `result.text`.

```typescript
import { MockLanguageModel, Options } from 'ai-test-kit/language';

const model = MockLanguageModel('Hi');

await generateText({ model, prompt: 'x', ...Options.generate });
streamText({ model, prompt: 'x', ...Options.stream });
```

### Inspecting Calls

`doGenerate` and `doStream` are `vi.fn()` spies, so the full Vitest API works. Each call is also recorded on `doGenerateCalls` / `doStreamCalls`, which you can read without Vitest.

```typescript
const model = MockLanguageModel('hi');

await generateText({ model, prompt: 'question' });

// Vitest spy
expect(model.doGenerate).toHaveBeenCalledTimes(1);
model.doGenerate.mock.calls[0][0].prompt;

// Recorded call options
model.doGenerateCalls.length; // 1
model.doGenerateCalls[0].prompt;
```

### Custom Identity

Override `provider` and `modelId`; otherwise the model uses `mock-provider` and an auto-incrementing id.

```typescript
const model = MockLanguageModel('hi', { provider: 'acme', modelId: 'acme-1' });
model.provider; // 'acme'
model.modelId; // 'acme-1'
```

## API

### `MockLanguageModel(input?, options?)`

Creates a mock `LanguageModelV3`. Exported as both a value (the factory) and a type (the model instance).

- `input` (optional), a single response (repeated for every call) or an `Array` of responses (one per call, clamped to the last). See [`MockResponse`](#mockresponse).
- `options.provider` (optional), defaults to `mock-provider`
- `options.modelId` (optional), defaults to an auto-incrementing `mock-model-{n}`

```ts
const model = MockLanguageModel('Hello, world!');
const flaky = MockLanguageModel([new Error('rate limited'), 'recovered']);
```

The returned model exposes `doGenerate` / `doStream` as `vi.fn()` spies and records call options on `doGenerateCalls` / `doStreamCalls`.

#### `.content(input)`

Build a content array for a generate result. A `string` becomes a single text part; an array of parts passes through.

```ts
MockLanguageModel.content('hi'); // [{ type: 'text', text: 'hi' }]
```

#### `.result(input)`

Build a full `LanguageModelV3GenerateResult`, filling finish reason, usage, and warnings. Accepts a `string` or `{ content, finishReason?, usage? }`.

```ts
MockLanguageModel.result('hi');
```

#### `.streamResult(input, opts?)`

Build a full `LanguageModelV3StreamResult`. A `string` is assembled into `stream-start` → text → `finish`; an array of parts is used as-is.

- `opts.initialDelayInMs` (optional)
- `opts.chunkDelayInMs` (optional)

```ts
MockLanguageModel.streamResult('hi', { chunkDelayInMs: 5 });
```

#### `.usage(overrides?)`

Build a `LanguageModelV3Usage`, overriding individual token fields on top of the defaults.

```ts
MockLanguageModel.usage({ outputTokens: { total: 99 } });
```

#### `.finishReason(unified?)`

Build a `LanguageModelV3FinishReason` from its unified value (raw mirrors it). Defaults to `stop`.

```ts
MockLanguageModel.finishReason('length'); // { unified: 'length', raw: 'length' }
```

### `Content`

Builders for the static content parts returned from `doGenerate`.

```ts
Content.text(text);
Content.reasoning(text);
Content.toolCall({ toolCallId, toolName, input }); // input is JSON-stringified unless a string
Content.toolResult({ toolCallId, toolName, result, isError? });
Content.file({ mediaType, data });
Content.source({ id, url, title? });
```

### `StreamParts`

Builders for individual stream parts emitted by `doStream`. The text-like builders return a `start` / `delta` / `end` block (without `finish`); control parts are single parts.

```ts
StreamParts.text(text, { id?, length?, separator? });      // Array<StreamPart>
StreamParts.reasoning(text, { id?, length?, separator? });  // Array<StreamPart>
StreamParts.toolInput({ id, toolName, input, length? });    // Array<StreamPart>
StreamParts.toolCall({ toolCallId, toolName, input });
StreamParts.toolResult({ toolCallId, toolName, result, isError? });
StreamParts.source({ id, url, title? });
StreamParts.file({ mediaType, data });
StreamParts.finish({ finishReason?, usage? });
StreamParts.error(error);
StreamParts.streamStart(warnings?);
StreamParts.responseMetadata(meta?);
StreamParts.raw(value);
```

### `Stream`

Operations for building, draining, and inspecting streams.

```ts
Stream.from(parts);                  // Array<T> -> ReadableStream<T>
Stream.simulate(chunks, { initialDelayInMs?, chunkDelayInMs? });
Stream.toArray(stream);              // ReadableStream<T> -> Promise<Array<T>>
Stream.text(parts);                  // join text-delta parts -> string
Stream.finishReason(parts);          // FinishReason | undefined
```

### `Options`

Determinism helpers to spread into `generateText()` / `streamText()`.

```ts
Options.generateId(); // stable id, 'aitxt-mock-id'
Options.generate; // { _internal: { generateId } }
Options.stream; // { _internal: { generateId, now } }
```

> [!NOTE]
> `Options.stream` pins timestamps via `_internal.now`, but the AI SDK uses `new Date()` directly on the `finish-step` part in the error streaming path. Tests that hit that path additionally need `vi.useFakeTimers()`.

## Types

All types are exported from `ai-test-kit/language`.

### `MockResponse`

A single mock response. A `string` or `Error` applies to whichever method is called; the object forms target one method explicitly. Pass an `Array<MockResponse>` to sequence responses across calls.

```ts
type MockResponse =
  | string // text, for both generate and stream
  | Error // both methods throw
  | { content; finishReason?; usage? } // generate result, or a derived stream
  | { generate?; stream? }; // generate and/or stream explicitly
```

### `MockLanguageModel`

The mock model instance type, as returned by `MockLanguageModel()`.

```ts
import type { MockLanguageModel } from 'ai-test-kit/language';

function withModel(model: MockLanguageModel) {
  model.doGenerateCalls; // recorded call options
}
```

### `GenerateResponse` / `StreamResponse`

The per-method response shapes used by the `{ generate, stream }` form of `MockResponse`. `stream` accepts a bare `Array<StreamPart>`, or a `{ chunks, initialDelayInMs?, chunkDelayInMs? }` object to simulate delays.

```ts
import type { GenerateResponse, StreamResponse } from 'ai-test-kit/language';
```

### `MockLanguageModelOptions`

The identity overrides accepted as the second argument to `MockLanguageModel()`.

```ts
import type { MockLanguageModelOptions } from 'ai-test-kit/language';
// { provider?: string; modelId?: string }
```

### `StreamPartOptions`

Options for the streamed-text part builders (`StreamParts.text` / `StreamParts.reasoning`).

```ts
import type { StreamPartOptions } from 'ai-test-kit/language';
// { id?: string; length?: number; separator?: string }
```

### `StreamDelayOptions`

Simulated timing shared by `Stream.simulate`, `MockLanguageModel.streamResult`, and the `stream` chunks form.

```ts
import type { StreamDelayOptions } from 'ai-test-kit/language';
// { initialDelayInMs?: number; chunkDelayInMs?: number }
```

## License

MIT
