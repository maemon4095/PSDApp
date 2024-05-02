import { Dispatch, StateUpdater } from "preact/hooks";

export function unsafeAssertType<T>(_args: unknown): asserts _args is T {

}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function mapState<T, U>(setState: Dispatch<StateUpdater<T>>, f: (t: U) => T): ((v: U) => void) & ((update: (old: T) => U) => void) {
    return (now: U | ((old: T) => U)) => {
        if (now instanceof Function) {
            setState(old => f(now(old)));
        } else {
            setState(f(now));
        }
    };
}