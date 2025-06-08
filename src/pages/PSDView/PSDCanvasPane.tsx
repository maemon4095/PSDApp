import { type Dispatch, useEffect, useReducer, useRef } from "preact/hooks";
import type { PsdServer, PsdStructureRoot } from "~/lib/psd.ts";
import PSDCanvasArea, {
  type CanvasTransform,
} from "~/pages/PSDView/PSDCanvasArea.tsx";
import PSDCanvasPaneHeader from "~/pages/PSDView/PSDCanvasPaneHeader.tsx";
import PSDCanvasPaneFooter from "./PSDCanvasPaneFooter.tsx";

export const commandReset = Symbol();
export const commandFit = Symbol();
export type CanvasTransformCommand = typeof commandReset | typeof commandFit;
export type CanvasTransformAction =
  | Partial<CanvasTransform>
  | CanvasTransformCommand
  | ((t: CanvasTransform) => Partial<CanvasTransform>);
export type CanvasTransformDispatch = Dispatch<CanvasTransformAction>;

export default function CanvasPane(
  { filename, psdStructure, server }: {
    filename: string;
    server: PsdServer;
    psdStructure: PsdStructureRoot;
  },
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useReducer(
    (old: CanvasTransform, action: CanvasTransformAction) => {
      if (action === commandReset) {
        return { scale: 1, x: 0, y: 0 };
      }
      if (action === commandFit) {
        return fitCanvas();
      }
      const t = action instanceof Function ? action(old) : action;
      const u = { ...old, ...t };
      u.x = Math.floor(u.x);
      u.y = Math.floor(u.y);
      return u;
    },
    { scale: 1, x: 0, y: 0 },
  );

  const canvasAreaRef = useRef<HTMLDivElement>(null);

  function fitCanvas() {
    const container = canvasAreaRef.current!;
    const containerRect = container.getBoundingClientRect();
    const scaleW = containerRect.width / psdStructure.width;
    const scaleH = containerRect.height / psdStructure.height;
    const scale = Math.min(scaleW, scaleH);
    const x = (containerRect.width - psdStructure.width * scale) / 2;
    const y = (containerRect.height - psdStructure.height * scale) / 2;
    return { scale, x: Math.floor(x), y: Math.floor(y) };
  }

  useEffect(() => {
    setTransform(commandFit);
  }, []);

  return (
    <div class="grid grid-t-cols-[1fr] grid-t-rows-[auto_1fr_auto]">
      <PSDCanvasPaneHeader
        transform={transform}
        setTransform={setTransform}
        canvasRef={canvasRef}
      />
      <PSDCanvasArea
        canvasRef={canvasRef}
        server={server}
        containerRef={canvasAreaRef}
        psdStructure={psdStructure}
        transform={transform}
        setTransform={setTransform}
      />
      <PSDCanvasPaneFooter
        filename={filename}
        psdStructure={psdStructure}
        server={server}
      />
    </div>
  );
}
