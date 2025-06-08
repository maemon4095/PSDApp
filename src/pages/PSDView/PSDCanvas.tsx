import type { JSX, RefObject } from "preact";
import { useEffect } from "preact/hooks";
import type { PsdServer, PsdStructureRoot } from "~/lib/psd.ts";
import type { CanvasTransform } from "~/pages/PSDView/PSDCanvasArea.tsx";

export default function PSDCanvas(
  { psdStructure, transform, server, canvasRef }: {
    server: PsdServer;
    transform?: CanvasTransform;
    psdStructure: PsdStructureRoot;
    canvasRef: RefObject<HTMLCanvasElement>;
  },
) {
  const psd = server;

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
