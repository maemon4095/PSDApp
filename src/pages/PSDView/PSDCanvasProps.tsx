import { h } from "preact";
import Header from "~/pages/PSDView/Header.tsx";
import { CanvasTransform } from "~/pages/PSDView/PSDCanvasArea.tsx";
import Button from "~/components/Button.tsx";
import {
  CanvasLayoutCommand,
  COMMAND_fit,
} from "~/pages/PSDView/PSDCanvasPane.tsx";

export default function PSDCanvasProps(
  { transform, setTransform }: {
    transform?: CanvasTransform;
    setTransform: (
      update: (t: CanvasTransform) => CanvasTransform | CanvasLayoutCommand,
    ) => void;
  },
) {
  return (
    <Header>
      <div class="flex flex-row">
        <TransformInput
          label="x"
          value={transform?.x}
          onInput={(x) => setTransform((t) => t && { ...t, x })}
        />
        <TransformInput
          label="y"
          value={transform?.y}
          onInput={(y) => setTransform((t) => t && { ...t, y })}
        />
        <TransformInput
          label="scale"
          value={transform?.scale.toFixed(2)}
          step={0.01}
          onInput={(scale) => setTransform((t) => t && { ...t, scale })}
        />
      </div>
      <Button onClick={() => setTransform((t) => t && { ...t, scale: 1 })}>
        原寸大
      </Button>
      <Button onClick={() => setTransform(() => COMMAND_fit)}>
        fit
      </Button>
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
  const onChange: h.JSX.InputEventHandler<HTMLInputElement> = (e) => {
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
