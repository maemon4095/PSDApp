import { h } from "preact";
import {
  Dispatch,
  StateUpdater,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { Group, Layer, Psd } from "~/lib/psd.ts";
import PSDCanvas from "~/pages/PSDView/PSDCanvas.tsx";

export type CanvasTransform = { scale: number; x: number; y: number };

type Props = {
  psd: Psd;
  version: number;
  transform?: CanvasTransform;
  setTransform: (
    update: (t: undefined | CanvasTransform) => CanvasTransform,
  ) => void;
};

const DEFAULT_TRANSFORM = { scale: 0, x: 0, y: 0 } satisfies CanvasTransform;

export default function PSDCanvasArea(
  { psd, version, transform, setTransform }: Props,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (transform) return;
    // initial layout; fit canvas and centering
    const container = containerRef.current!;
    const containerRect = container.getBoundingClientRect();
    const scaleW = containerRect.width / psd.width;
    const scaleH = containerRect.height / psd.height;
    const scale = Math.min(scaleW, scaleH);
    const x = (containerRect.width - psd.width * scale) / 2;
    const y = (containerRect.height - psd.height * scale) / 2;
    setTransform(() => ({ scale, x, y }));
  }, [transform]);

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
      <div
        style={{ top: transform?.y, left: transform?.x }}
        class="absolute border shadow-lg border-stone-600"
      >
        <PSDCanvas
          psd={psd}
          version={version}
          scale={transform?.scale ?? DEFAULT_TRANSFORM.scale}
        />
      </div>
    </div>
  );
}
