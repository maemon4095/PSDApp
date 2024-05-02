import { h } from "preact";
import { MutableRef, useState } from "preact/hooks";
import { Psd } from "~/lib/psd.ts";
import PSDCanvas from "~/pages/PSDView/PSDCanvas.tsx";

export type CanvasTransform = { scale: number; x: number; y: number };

type Props = {
  psd: Psd;
  containerRef: MutableRef<HTMLDivElement | null>;
  version: number;
  transform?: CanvasTransform;
  setTransform: (
    update: (t: CanvasTransform) => CanvasTransform,
  ) => void;
};

const DEFAULT_TRANSFORM = { scale: 0, x: 0, y: 0 } satisfies CanvasTransform;

export default function PSDCanvasArea(
  { psd, version, transform, containerRef, setTransform }: Props,
) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      ref={containerRef}
      class="overflow-hidden translate-x-0 bg-slate-200"
      onWheel={(e) => {
        const sign = Math.sign(-e.deltaY);
        const containerRect = containerRef.current!.getBoundingClientRect();
        setTransform((t) => {
          t ??= DEFAULT_TRANSFORM;
          const mouseX = e.clientX - containerRect.x;
          const mouseY = e.clientY - containerRect.y;
          const deltaX = mouseX - t.x;
          const deltaY = mouseY - t.y;
          const scale = Math.max(
            t.scale + sign * t.scale * 0.05,
            0,
          );
          const rs = scale / t.scale;
          const x = mouseX - deltaX * rs;
          const y = mouseY - deltaY * rs;
          return { x, y, scale };
        });
      }}
      onPointerDown={() => setDragging(true)}
      onPointerMove={(e) => {
        if (!dragging) return;
        setTransform((t) => {
          t ??= DEFAULT_TRANSFORM;
          return {
            x: t.x + e.movementX,
            y: t.y + e.movementY,
            scale: t.scale,
          };
        });
      }}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <PSDCanvas
        psd={psd}
        version={version}
        transform={transform}
      />
    </div>
  );
}
