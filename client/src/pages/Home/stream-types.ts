export type StreamEntry =
  | { type: "line"; value: string }
  | { type: "prompt"; value: string }
  | { type: "response-end" };

export type StreamSegment =
  | { type: "code"; lines: string[]; lang: string; key: number }
  | { type: "text"; line: string; key: number }
  | { type: "prompt"; line: string; key: number };
