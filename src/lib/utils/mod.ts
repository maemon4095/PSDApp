export type Removed<T extends object, K extends keyof T> = { [k in Exclude<keyof T, K>]: T[k] };
export type Optional<T extends object, K extends keyof T> = Removed<T, K> & { [k in K]?: T[k] };

export function unsafeAssertType<T>(_args: unknown): asserts _args is T {

}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

