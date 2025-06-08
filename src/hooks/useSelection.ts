import { useMemo, useState } from "preact/hooks";

type SelectionMap<T extends Record<number | string | symbol, boolean>> = {
  [id in keyof T]?: undefined | {
    next: keyof T | undefined;
    prev: keyof T | undefined;
  };
};

type SelectionState<T extends Record<number | string | symbol, boolean>> = {
  map: SelectionMap<T>;
  count: number;
  limit?: number;
  firstId?: keyof T;
  lastId?: keyof T;
};

export function useSelection<
  T extends Record<number | string | symbol, boolean>,
>(
  initialSelection: T | (() => T),
  limit?: number,
) {
  const initial = initialSelection instanceof Function
    ? initialSelection()
    : initialSelection;

  const [state, setState] = useState<SelectionState<T>>(() => {
    const keys = Reflect.ownKeys(initial);

    let state: SelectionState<T> = {
      map: {},
      count: 0,
      limit,
    };

    for (const key of keys) {
      if (initial[key]) {
        state = _select(state, key);
      }
    }

    return state;
  });

  const select = (id: keyof T) =>
    setState((selection) => _select(selection, id));
  const unselect = (id: keyof T) =>
    setState((selection) => _unselect(selection, id));
  const setLimit = (limit: number | undefined) => {
    setState((selection) => _setLimit(selection, limit));
  };

  const selection = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(state.map).map((key) =>
          [key, state.map[key] !== undefined] as const
        ),
      ),
    [state],
  );

  return [selection as T, select, unselect, setLimit] as const;
}

function _setLimit<T extends Record<number | string | symbol, boolean>>(
  selection: SelectionState<T>,
  limit: number | undefined,
) {
  const oldLimit = selection.limit;
  selection.limit = limit;
  if (!limit || oldLimit === limit) {
    return selection;
  }

  let exceeds = selection.count - limit;

  while (exceeds > 0) {
    selection = _unselect(selection, selection.lastId!);
    exceeds -= 1;
  }

  return selection;
}

function _select<T extends Record<number | string | symbol, boolean>>(
  selection: SelectionState<T>,
  id: keyof T,
): SelectionState<T> {
  let { map, limit, count, firstId, lastId } = selection;
  if (map[id] !== undefined) {
    return selection;
  }

  if (limit && count >= limit && lastId !== undefined) {
    const last = map[lastId]!;
    map[lastId] = undefined;
    const { prev } = last;
    if (prev === undefined) {
      firstId = undefined;
    } else {
      map[prev]!.next = undefined;
    }
    lastId = prev;
    count -= 1;
  }

  if (firstId === undefined) {
    lastId = id;
  } else {
    map[firstId]!.prev = id;
  }

  count += 1;
  map[id] = { next: firstId, prev: undefined };
  firstId = id;

  return { map, limit, count, firstId, lastId };
}

function _unselect<T extends Record<number | string | symbol, boolean>>(
  selection: SelectionState<T>,
  id: keyof T,
): SelectionState<T> {
  let { map, limit, count, firstId, lastId } = selection;
  if (map[id] === undefined) {
    return selection;
  }

  const entry = map[id]!;
  map[id] = undefined;
  if (entry.prev === undefined) {
    firstId = entry.next;
  } else {
    map[entry.prev]!.next = entry.next;
  }
  if (entry.next === undefined) {
    lastId = entry.prev;
  } else {
    map[entry.next]!.prev = entry.prev;
  }
  count -= 1;

  return { map, limit, count, firstId, lastId };
}
