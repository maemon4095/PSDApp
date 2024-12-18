export type Removed<T, K extends keyof T> = {
  [k in Exclude<keyof T, K>]: T[k];
};
export type Optional<T, K extends keyof T> =
  & Removed<T, K>
  & { [k in K]?: T[k] };

export type Mutable<T> = { -readonly [k in keyof T]: T[k] };

export function unsafeAssertType<T>(_args: unknown): asserts _args is T {
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
