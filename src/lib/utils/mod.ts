import { Dispatch, StateUpdater } from "preact/hooks";

export function unsafeAssertType<T>(_args: unknown): asserts _args is T {

}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function mapState<T>(setState: Dispatch<StateUpdater<T>>, f: (t: T) => T): Dispatch<StateUpdater<T>> {
    return t => {
        if (t instanceof Function) {
            setState(v => f(t(v)));
        } else {
            setState(f(t));
        }
    };
}