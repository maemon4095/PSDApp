export function unsafeAssertType<T>(_args: unknown): asserts _args is T {

}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);

}