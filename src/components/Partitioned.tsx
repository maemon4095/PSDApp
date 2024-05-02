import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { ComponentChildren, Fragment, h, toChildArray } from "preact";

type Direction = "row" | "column";

const handleSize = 9;
// ハンドルの移動で他のハンドルが移動しないようにしたい。
// 各Paneのサイズを保持すればよさそう。
// 初期サイズもうまく調整できるようにしたい。比率で調節できればよい。
export default function Partitioned(
  props: {
    firstSize?: number;
    direction: Direction;
    children?: ComponentChildren;
  },
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(null as null | [number, number]);
  const [firstSize, setFirstSize] = useState(props.firstSize ?? 0);

  const { first, last, handleArea } = useMemo(() => {
    const [first, ...lasts] = toChildArray(props.children);
    if (lasts.length === 0) {
      return { first, last: undefined, handleArea: 0 };
    }
    if (lasts.length === 1) {
      return { first, last: lasts[0], handleArea: handleSize };
    }
    return {
      handleArea: handleSize * lasts.length,
      first,
      last: <Partitioned direction={props.direction}>{lasts}</Partitioned>,
    };
  }, [props.children]);

  const contents = (() => {
    if (firstSize === undefined) {
      return <div class="child-full flex-1">{first}</div>;
    }
    return (
      <>
        <div
          class="child-full min-h-0 min-w-0 overflow-hidden"
          style={{
            flexBasis: `${firstSize}px`,
          }}
        >
          {first}
        </div>
        <Handle
          dir={props.direction}
          onPointerDown={(e) => {
            setDragOffset([e.offsetX, e.offsetY]);
          }}
        />
        <div class="child-full flex-1 min-h-0 min-w-0 overflow-hidden">
          {last}
        </div>
      </>
    );
  })();

  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    if (!dragOffset) return;
    const container = containerRef.current;
    if (!container) return;
    const origin = container.getBoundingClientRect();
    const [offsetX, offsetY] = dragOffset;

    if (props.direction === "row") {
      const x = Math.floor(e.clientX - origin.x - offsetX);
      setFirstSize(Math.min(x, origin.width - handleArea));
    } else {
      const y = Math.floor(e.clientY - origin.y - offsetY);
      setFirstSize(Math.min(y, origin.height - handleArea));
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    setDragOffset(null);
  };

  useEffect(() => {
    document.addEventListener("pointerup", onPointerUp);
    return () => document.removeEventListener("pointerup", onPointerUp);
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      class="flex items-stretch overflow-hidden"
      style={{ flexDirection: props.direction }}
    >
      {contents}
    </div>
  );
}

function Handle(
  props: {
    dir: Direction;
    onPointerDown?: (e: h.JSX.TargetedPointerEvent<HTMLDivElement>) => void;
  },
) {
  const { dir } = props;
  const cursor = dir === "row" ? "col-resize" : "row-resize";

  const style: h.JSX.CSSProperties = {
    flex: `0 0 ${handleSize}px`,
    flexDirection: dir,
    cursor,
  };

  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        props.onPointerDown?.(e);
      }}
      class="flex justify-center shadow z-10 bg-gray-300"
      style={style}
    >
    </div>
  );
}
