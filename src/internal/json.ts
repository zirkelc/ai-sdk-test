/** Stringifies tool input to the JSON string the provider spec expects, leaving strings untouched. */
export const toJSONString = (input: unknown): string => (typeof input === 'string' ? input : JSON.stringify(input));
