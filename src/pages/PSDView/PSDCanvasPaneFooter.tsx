import { useContext } from "preact/hooks";
import Loading from "../../components/Loading.tsx";
import TriggerInput from "../../components/TriggerInput.tsx";
import { switcher } from "~/App.tsx";
import { DefaultLayoutContext } from "../../layouts/default.tsx";
import type { PsdServer, PsdStructureRoot } from "../../lib/psd.ts";

export default function PSDCanvasPaneFooter(
  { filename, psdStructure, server }: {
    filename: string;
    server: PsdServer;
    psdStructure: PsdStructureRoot;
  },
) {
  const context = useContext(DefaultLayoutContext);
  return (
    <div class="flex flex-row border-t p-1 text-sm gap-1">
      <button
        type="button"
        class="control-button"
        onClick={() => switcher.switch("home")}
      >
        ✖
      </button>
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
            const psd = server;
            await psd.parse(raw);
            const psdStructure = (await psd.getStructure())!;

            context.setPopup(null);
            switcher.switch("viewer", {
              server,
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
  );
}
