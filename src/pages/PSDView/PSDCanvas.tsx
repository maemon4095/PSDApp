import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { type Psd, render } from "~/lib/psd.ts";
import type { CanvasTransform } from "~/pages/PSDView/PSDCanvasArea.tsx";

export default function PSDCanvas(
  { psd, version, transform }: {
    transform?: CanvasTransform;
    psd: Psd;
    version: number;
  },
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("render");
    const image = render(psd);
    const canvas = canvasRef.current!;
    const canvasContext = canvas.getContext("2d")!;
    canvasContext.putImageData(image, 0, 0);
  }, [psd, version]);

  const style = transform && {
    left: transform.x,
    top: transform.y,
    width: transform.scale * psd.width,
    height: transform.scale * psd.height,
  } satisfies JSX.CSSProperties;

  return (
    <canvas
      ref={canvasRef}
      width={psd.width}
      height={psd.height}
      style={style}
      class="absolute border shadow-lg border-stone-600"
    />
  );
}
