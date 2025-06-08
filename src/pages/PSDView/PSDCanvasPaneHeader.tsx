import type { JSX, RefObject } from "preact";
import Header from "~/pages/PSDView/Header.tsx";
import type { CanvasTransform } from "~/pages/PSDView/PSDCanvasArea.tsx";
import * as path from "@std/path";

import {
  type CanvasTransformDispatch,
  commandFit,
} from "~/pages/PSDView/PSDCanvasPane.tsx";

export default function PSDCanvasPaneHeader(
  { filename, transform, setTransform, canvasRef }: {
    filename: string;
    transform?: CanvasTransform;
    setTransform: CanvasTransformDispatch;
    canvasRef: RefObject<HTMLCanvasElement>;
  },
) {
  return (
    <Header>
      <div class="flex flex-row">
        <TransformInput
          label="x"
          value={transform?.x}
          onInput={(x) => setTransform({ x })}
        />
        <TransformInput
          label="y"
          value={transform?.y}
          onInput={(y) => setTransform({ y })}
        />
        <TransformInput
          label="scale"
          value={transform?.scale.toFixed(2)}
          step={0.01}
          onInput={(scale) => setTransform({ scale })}
        />
      </div>
      <button
        type="button"
        class="control-button"
        onClick={() => setTransform({ scale: 1 })}
      >
        原寸大
      </button>
      <button
        type="button"
        class="control-button"
        onClick={() => setTransform(commandFit)}
      >
        fit
      </button>

      <button
        type="button"
        class="control-button ml-auto"
        onClick={() => {
          const canvas = canvasRef.current;
          if (canvas === null) return;

          canvas.toBlob((blob) => {
            if (blob === null) return;
            const ext = path.extname(filename);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.download = filename.slice(0, -ext.length) + ".png";
            anchor.href = url;
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
          });
        }}
      >
        保存
      </button>
    </Header>
  );
}

function TransformInput(
  { label, value, step, ...handlers }: {
    label: string;
    value?: number | string;
    step?: number;
    onInput: (v: number) => void;
  },
) {
  const onChange: JSX.InputEventHandler<HTMLInputElement> = (e) => {
    const target = e.currentTarget;
    let value = parseFloat(target.value);
    if (Number.isNaN(value)) {
      target.setCustomValidity("invalid");
    } else {
      if (step) {
        value = Math.floor(value / step) * step;
      }
      target.setCustomValidity("");
      handlers.onInput(value);
    }
  };

  return (
    <label class="border inline-block -ml-px pl-1 min-w-max">
      {label}:&nbsp;
      <input
        type="number"
        value={value}
        onChange={onChange}
        step={step}
        class="w-12"
      />
    </label>
  );
}
