import { switcher } from "~/App.tsx";
import { parse } from "~/lib/psd.ts";
import { useContext } from "preact/hooks";
import { DefaultLayoutContext } from "~/layout/default.tsx";
import Credits from "~/pages/Home/Credits.tsx";
import Loading from "~/components/Loading.tsx";

export default function Home() {
  const context = useContext(DefaultLayoutContext);

  const onFileSubmit = (files: FileList | null | undefined) => {
    if (!files) return;
    const file = files.item(0);
    if (!file) return;
    context.setPopup(<Loading name={file.name} />, (e) => e.preventDefault());

    file.arrayBuffer().then(async (buf) => {
      const psd = await parse(buf);
      context.setPopup(null);
      switcher.switch("viewer", { psd, filename: file.name });
    });
  };

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
          >
          </input>
          <p>ここにファイルをドロップ</p>
        </div>
      </div>
      <footer class="border shadow-inner rounded p-1 px-2 flex flex-row justify-center">
        <button
          onClick={() => {
            context.setPopup(<Credits />);
          }}
          class="link"
        >
          credit
        </button>
      </footer>
    </div>
  );
}
