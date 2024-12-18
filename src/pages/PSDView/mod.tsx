import PsdStrucutureView from "~/pages/PSDView/PSDStructureView.tsx";
import Partitioned from "~/components/Partitioned.tsx";
import type { PsdStructureRoot } from "~/lib/psd.ts";
import Header from "~/pages/PSDView/Header.tsx";
import CanvasPane from "~/pages/PSDView/PSDCanvasPane.tsx";

export default function PSDView(
  { psdStructure, filename }: {
    psdStructure: PsdStructureRoot;
    filename: string;
  },
) {
  return (
    <div class="size-full overflow-hidden grid grid-t-rows-[1fr]">
      <Partitioned firstSize={300} direction="row">
        <div class="grid grid-t-rows-[auto_1fr] overflow-hidden">
          <Header>
            レイヤー
          </Header>
          <div class="overflow-auto">
            <PsdStrucutureView
              psdStructure={psdStructure}
            />
          </div>
        </div>
        <CanvasPane
          psdStructure={psdStructure}
          filename={filename}
        />
      </Partitioned>
    </div>
  );
}
