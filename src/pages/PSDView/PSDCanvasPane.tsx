import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { parsePsd, Psd } from "~/lib/psd.ts";
import PSDCanvasArea, {
  CanvasTransform,
} from "~/pages/PSDView/PSDCanvasArea.tsx";
import PSDCanvasProps from "~/pages/PSDView/PSDCanvasProps.tsx";
import { mapState } from "~/lib/utils/mod.ts";
import Button from "~/components/Button.tsx";
import { switcher } from "~/App.tsx";
import TriggerInput from "~/components/TriggerInput.tsx";

export const COMMAND_reset = 0;
export const COMMAND_fit = 1;
export type CanvasLayoutCommand = typeof COMMAND_reset | typeof COMMAND_fit;

export default function CanvasPane(
  { psd, version }: { version: number; psd: Psd },
) {
  const [transform, rawSetTransform] = useState(
    { scale: 1, x: 0, y: 0 },
  );
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  const setTransform = mapState(
    rawSetTransform,
    (t: CanvasTransform | CanvasLayoutCommand) => {
      if (t === COMMAND_reset) {
        return { scale: 1, x: 0, y: 0 };
      }
      if (t === COMMAND_fit) {
        return fitCanvas();
      }

      t.x = Math.floor(t.x);
      t.y = Math.floor(t.y);
      return t;
    },
  );
  function fitCanvas() {
    const container = canvasAreaRef.current!;
    const containerRect = container.getBoundingClientRect();
    const scaleW = containerRect.width / psd.width;
    const scaleH = containerRect.height / psd.height;
    const scale = Math.min(scaleW, scaleH);
    const x = (containerRect.width - psd.width * scale) / 2;
    const y = (containerRect.height - psd.height * scale) / 2;
    return { scale, x: Math.floor(x), y: Math.floor(y) };
  }

  useEffect(() => {
    setTransform(COMMAND_fit);
  }, [psd]);

  return (
    <div class="grid grid-t-cols-[1fr] grid-t-rows-[auto_1fr_auto]">
      <PSDCanvasProps transform={transform} setTransform={setTransform} />
      <PSDCanvasArea
        containerRef={canvasAreaRef}
        psd={psd}
        version={version}
        transform={transform}
        setTransform={setTransform}
      />
      <div class="flex flex-row border-t p-1 text-sm gap-1">
        <Button onClick={() => switcher.switch("home")}>✖</Button>
        <TriggerInput
          type="file"
          accept=".psd, .psb"
          onInput={(e) => {
            const file = e.currentTarget.files?.[0];
            if (!file) return;
            parsePsd(file).then((psd) => {
              switcher.switch("viewer", { psd });
            });
          }}
        >
          📂
        </TriggerInput>
        <span class="ml-auto">{psd.name}@{psd.width}x{psd.height}</span>
      </div>
    </div>
  );
}
