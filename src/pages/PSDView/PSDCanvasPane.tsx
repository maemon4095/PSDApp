import {
  type Dispatch,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "preact/hooks";
import { PsdServer, type PsdStructureRoot } from "~/lib/psd.ts";
import PSDCanvasArea, {
  type CanvasTransform,
} from "~/pages/PSDView/PSDCanvasArea.tsx";
import PSDCanvasProps from "~/pages/PSDView/PSDCanvasProps.tsx";
import Button from "~/components/Button.tsx";
import { switcher } from "~/App.tsx";
import TriggerInput from "~/components/TriggerInput.tsx";
import { DefaultLayoutContext } from "~/layout/default.tsx";
import Loading from "~/components/Loading.tsx";

export const commandReset = Symbol();
export const commandFit = Symbol();
export type CanvasTransformCommand = typeof commandReset | typeof commandFit;
export type CanvasTransformAction =
  | Partial<CanvasTransform>
  | CanvasTransformCommand
  | ((t: CanvasTransform) => Partial<CanvasTransform>);
export type CanvasTransformDispatch = Dispatch<CanvasTransformAction>;

export default function CanvasPane(
  { filename, psdStructure }: {
    filename: string;
    psdStructure: PsdStructureRoot;
  },
) {
  const context = useContext(DefaultLayoutContext);
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
      <PSDCanvasProps transform={transform} setTransform={setTransform} />
      <PSDCanvasArea
        containerRef={canvasAreaRef}
        psdStructure={psdStructure}
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
            context.setPopup(
              <Loading name={file.name} />,
              (e) => e.preventDefault(),
            );
            file.arrayBuffer().then(async (raw) => {
              const psd = PsdServer.instance;
              await psd.parse(raw);
              const psdStructure = (await psd.getStructure())!;

              context.setPopup(null);
              switcher.switch("viewer", {
                psdStructure,
                filename: file.name,
              });
            });
          }}
        >
          📂
        </TriggerInput>
        <span class="ml-auto">
          {filename}@{psdStructure.width}x{psdStructure.height}
        </span>
      </div>
    </div>
  );
}
