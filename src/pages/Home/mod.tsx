import { switcher } from "~/App.tsx";
import { PsdServer } from "~/lib/psd.ts";
import { useContext, useState } from "preact/hooks";
import { DefaultLayoutContext } from "~/layouts/default.tsx";
import Credits from "~/pages/Home/Credits.tsx";
import Loading from "~/components/Loading.tsx";
// @deno-types=@loader-types/file.d.ts
import worker from "../../service.worker.ts";

export default function Home() {
  const context = useContext(DefaultLayoutContext);
  const [installed, setInstalled] = useState(false);

  const onFileSubmit = (files: FileList | null | undefined) => {
    if (!files) return;
    const file = files.item(0);
    if (!file) return;
    context.setPopup(<Loading name={file.name} />, (e) => e.preventDefault());

    file.arrayBuffer().then(async (buf) => {
      const psd = new PsdServer();
      await psd.parse(buf);
      const psdStructure = (await psd.getStructure())!;
      context.setPopup(null);
      switcher.switch("viewer", {
        server: psd,
        psdStructure,
        filename: file.name,
      });
    });
  };

  if ("serviceWorker" in navigator) {
    const { serviceWorker } = navigator;
    (async () => {
      const reg = await serviceWorker.getRegistrations();
      setInstalled(reg.length !== 0);
    })();
  }

  return (
    <div class="h-full w-full md:max-w-screen-md m-auto gap-4 p-4 flex flex-col items-stretch">
      <div>
        <h1>PSDApp</h1>
      </div>
      <div class="flex-1 flex flex-col justify-center">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.setAttribute("dragover", "");
          }}
          onDragLeave={(e) => {
            e.currentTarget.removeAttribute("dragover");
          }}
          onDragEnd={(e) => {
            e.currentTarget.removeAttribute("dragover");
          }}
          onDrop={(e) => {
            e.currentTarget.removeAttribute("dragover");
            e.preventDefault();
            onFileSubmit(e.dataTransfer?.files);
          }}
          class="flex flex-col gap-1 p-4 rounded border bg-slate-100"
        >
          <input
            type="file"
            accept=".psd, .psb"
            onInput={(e) => onFileSubmit(e.currentTarget.files)}
          />
          <p>ここにファイルをドロップ</p>
        </div>
      </div>
      <footer class="border shadow-inner rounded p-1 px-2 flex flex-row justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            context.setPopup(<Credits />);
          }}
          class="link"
        >
          credit
        </button>
        {!installed && (
          <button
            type="button"
            class="control-button"
            onClick={() => {
              const affirm = self.confirm(
                "サービスワーカーをインストールしますか？\n- オフラインでもPSDAppが利用可能になります。",
              );
              if (!affirm) return;
              navigator.serviceWorker.register(worker, { scope: "." });
              setInstalled(true);
            }}
          >
            install
          </button>
        )}
      </footer>
    </div>
  );
}
