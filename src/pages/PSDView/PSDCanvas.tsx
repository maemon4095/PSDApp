import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Group, Layer, Psd } from "~/lib/psd.ts";
import { CanvasTransform } from "~/pages/PSDView/PSDCanvasArea.tsx";

export default function PSDCanvas(
  { psd, version, transform }: {
    transform?: CanvasTransform;
    psd: Psd;
    version: number;
  },
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferCanvas = useMemo(() => {
    return new OffscreenCanvas(psd.width, psd.height);
  }, [psd]);

  useEffect(() => {
    console.log("render");
    // render
    (async () => {
      const context = bufferCanvas.getContext("2d", { alpha: true })!;
      await renderTo(psd, context);
      const canvas = canvasRef.current!;
      const canvasContext = canvas.getContext("2d")!;
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.drawImage(bufferCanvas, 0, 0);
    })();
  }, [psd, version]);

  const style = transform && {
    left: transform.x,
    top: transform.y,
    width: transform.scale * psd.width,
    height: transform.scale * psd.height,
  } satisfies h.JSX.CSSProperties;

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

function collectVisibleLayersInOrder(psd: Psd) {
  const layers: Layer[] = [];
  collectInto(psd.children, layers);
  layers.sort((l, r) => r.order - l.order);
  return layers;

  function collectInto(roots: (Layer | Group)[], layers_collect: Layer[]) {
    for (const entry of roots) {
      if (!entry.visible) continue;
      switch (entry.type) {
        case "Layer":
          layers_collect.push(entry);
          break;
        case "Group":
          collectInto(entry.children, layers_collect);
          break;
      }
    }
  }
}

async function renderTo(psd: Psd, context: OffscreenCanvasRenderingContext2D) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  const layers = collectVisibleLayersInOrder(psd);
  for (const l of layers) {
    const composed = await l.composite(true, true);
    const imageData = new ImageData(
      composed,
      l.width,
      l.height,
    );
    const image = await createImageBitmap(imageData);
    context.drawImage(image, l.left, l.top);
  }
}
