import { h } from "preact";
import { PsdStructure } from "~/lib/psd.ts";
import PsdStrucutureView from "~/pages/PSDView/PSDStructureView.tsx";
import Partitioned from "~/components/Partitioned.tsx";
import * as PSD from "~/lib/psd.ts";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

export default function PSDView({ structure }: { structure: PsdStructure }) {
  const profile = useMemo(() => PSD.getPsdProfile(), [structure]);
  console.log(structure);
  return (
    <div class="size-full overflow-hidden child-full">
      <Partitioned firstSize={192} direction="row">
        <div class="overflow-auto">
          <PsdStrucutureView roots={structure.roots} />
        </div>
        <PSDCanvas profile={profile} />
      </Partitioned>
    </div>
  );
}

function PSDCanvas({ profile }: { profile: PSD.PsdProfile }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });

  const style = {
    transform:
      `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
  } satisfies h.JSX.CSSProperties;

  useEffect(() => {
    const canvas = canvasRef.current!;
    PSD.drawInto(canvas);
  }, []);

  return (
    <div
      class="overflow-hidden"
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
        width={profile.width}
        height={profile.height}
        style={style}
      />
    </div>
  );
}
