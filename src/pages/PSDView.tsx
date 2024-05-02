import { h } from "preact";
import { useState } from "preact/hooks";
import PsdStrucutureView from "~/pages/PSDView/PSDStructureView.tsx";
import Partitioned from "~/components/Partitioned.tsx";
import { Psd } from "~/lib/psd.ts";
import Header from "~/pages/PSDView/Header.tsx";
import CanvasPane from "~/pages/PSDView/PSDCanvasPane.tsx";

export default function PSDView({ psd }: { psd: Psd }) {
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
    <div class="size-full overflow-hidden grid grid-t-rows-[1fr_auto]">
      <Partitioned firstSize={300} direction="row">
        <div class="grid grid-t-rows-[auto_1fr] overflow-hidden">
          <Header>
            レイヤー
          </Header>
          <div class="overflow-auto">
            <PsdStrucutureView roots={psd.children} onChange={onChange} />
          </div>
        </div>
        <CanvasPane psd={psd} version={version} />
      </Partitioned>
      <div class="bg-gray-300 h-2"></div>
    </div>
  );
}
