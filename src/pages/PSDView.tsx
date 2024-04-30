import { h } from "preact";
import PsdStrucutureView from "~/pages/PSDView/PSDStructureView.tsx";
import Partitioned from "~/components/Partitioned.tsx";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import Psd, { Group } from "psd";

export default function PSDView({ psd }: { psd: Psd }) {
  return (
    <div class="size-full overflow-hidden child-full">
      <Partitioned firstSize={192} direction="row">
        <div class="overflow-auto">
          <PsdStrucutureView roots={psd.children} />
        </div>
        <PSDCanvas psd={psd} />
      </Partitioned>
    </div>
  );
}

function PSDCanvas({ psd }: { psd: Psd }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });

  const style = {
    transform:
      `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
  } satisfies h.JSX.CSSProperties;

  useEffect(() => {
    (async () => {
      const canvas = canvasRef.current!;
      const composed = await psd.composite(true, true);
      const imageData = new ImageData(
        composed,
        psd.width,
        psd.height,
      );

      canvas.getContext("2d")?.putImageData(imageData, 0, 0);
    })();
  }, []);

  return (
    <div
      class="overflow-hidden bg-stone-500"
      onWheel={(e) => {
        const sign = Math.sign(-e.deltaY);
        setTransform((t) => ({
          x: t.x,
          y: t.y,
          scale: Math.max(t.scale + sign * t.scale * 0.05, 0),
        }));
      }}
      onPointerDown={() => setDragging(true)}
      onPointerMove={(e) => {
        if (!dragging) return;
        setTransform((t) => {
          return { x: t.x + e.movementX, y: t.y + e.movementY, scale: t.scale };
        });
      }}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <canvas
        ref={canvasRef}
        width={psd.width}
        height={psd.height}
        style={style}
        class="border shadow"
      />
    </div>
  );
}
