import { useEffect, useRef, useState } from "preact/hooks";
import { ComponentChildren, h } from "preact";
import Progress from "~/components/Progress.tsx";
export default function App() {
  return (
    <div class="size-full flex flex-col items-stretch">
      <div class="flex-1 grid place-content-stretch">
        <ResizeBox>
          <Progress progress={0.5} status="yo"></Progress>
        </ResizeBox>
      </div>
    </div>
  );
}

function ResizeBox({ children }: { children?: ComponentChildren }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 0,
  });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const x0 = container.clientWidth * 0.25;
    const y0 = container.clientHeight * 0.25;
    const x1 = container.clientWidth * 0.75;
    const y1 = container.clientHeight * 0.75;
    setPos({ x0, y0, x1, y1 });
  }, []);

  return (
    <div
      ref={containerRef}
      class="translate-x-0"
    >
      <div
        style={{
          left: Math.min(pos.x0, pos.x1),
          top: Math.min(pos.y0, pos.y1),
          width: Math.abs(pos.x1 - pos.x0),
          height: Math.abs(pos.y1 - pos.y0),
        }}
        class="resize-box"
      >
        {children}
      </div>
      <span
        onPointerMove={(e) => {
          if (e.buttons !== 1) return;
          setPos({
            ...pos,
            x0: pos.x0 + e.movementX,
            y0: pos.y0 + e.movementY,
          });
        }}
        class="resize-box-handle"
        style={{ left: pos.x0, top: pos.y0 }}
      />
      <span
        onPointerMove={(e) => {
          if (e.buttons !== 1) return;
          setPos({
            ...pos,
            x1: pos.x1 + e.movementX,
            y1: pos.y1 + e.movementY,
          });
        }}
        class="resize-box-handle"
        style={{ left: pos.x1, top: pos.y1 }}
      />
    </div>
  );
}
