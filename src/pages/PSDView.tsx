import { useState } from "preact/hooks";
import PsdStrucutureView from "~/pages/PSDView/PSDStructureView.tsx";
import Partitioned from "~/components/Partitioned.tsx";
import type { Psd } from "~/lib/psd.ts";
import Header from "~/pages/PSDView/Header.tsx";
import CanvasPane from "~/pages/PSDView/PSDCanvasPane.tsx";

export default function PSDView(
  { psd, filename }: { psd: Psd; filename: string },
) {
  const [version, setVersion] = useState(0);
  const onChange = () => {
    setVersion((v) => {
      if (Number.isSafeInteger(v + 1)) {
        return v + 1;
      }
      return 0;
    });
  };

  return (
    <div class="size-full overflow-hidden grid grid-t-rows-[1fr]">
      <Partitioned firstSize={300} direction="row">
        <div class="grid grid-t-rows-[auto_1fr] overflow-hidden">
          <Header>
            レイヤー
          </Header>
          <div class="overflow-auto">
            <PsdStrucutureView psd={psd} onChange={onChange} />
          </div>
        </div>
        <CanvasPane psd={psd} filename={filename} version={version} />
      </Partitioned>
    </div>
  );
}
