import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { PsdServer, type PsdStructureRoot } from "~/lib/psd.ts";
import type { CanvasTransform } from "~/pages/PSDView/PSDCanvasArea.tsx";

export default function PSDCanvas(
  { psdStructure, transform }: {
    transform?: CanvasTransform;
    psdStructure: PsdStructureRoot;
  },
) {
  const psd = PsdServer.instance;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async () => {
      await psd.mount(canvasRef.current!.transferControlToOffscreen());
      await psd.render();
    })();

    return () => {
      psd.unmount();
    };
  }, []);

  const style = transform && {
    left: transform.x,
    top: transform.y,
    width: transform.scale * psdStructure.width,
    height: transform.scale * psdStructure.height,
  } satisfies JSX.CSSProperties;

  return (
    <canvas
      ref={canvasRef}
      width={psdStructure.width}
      height={psdStructure.height}
      style={style}
      class="absolute border shadow-lg border-stone-600"
    />
  );
}
