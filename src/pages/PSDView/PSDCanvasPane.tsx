import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Group, Layer, Psd } from "~/lib/psd.ts";
import PSDCanvasArea, {
  CanvasTransform,
} from "~/pages/PSDView/PSDCanvasArea.tsx";
import PSDCanvasProps from "~/pages/PSDView/PSDCanvasProps.tsx";
import { mapState } from "~/lib/utils/mod.ts";

export default function CanvasPane(
  { psd, version }: { version: number; psd: Psd },
) {
  const [transform, rawSetTransform] = useState(
    undefined as CanvasTransform | undefined,
  );

  const setTransform = mapState(rawSetTransform, (t) => {
    if (!t) return t;
    t.x = Math.floor(t.x);
    t.y = Math.floor(t.y);
    return t;
  });
  return (
    <div class="grid grid-t-cols-[1fr] grid-t-rows-[auto_1fr]">
      <PSDCanvasProps transform={transform} setTransform={setTransform} />
      <PSDCanvasArea
        psd={psd}
        version={version}
        transform={transform}
        setTransform={setTransform}
      />
    </div>
  );
}
