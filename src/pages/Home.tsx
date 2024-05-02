import { h } from "preact";
import { useContext } from "preact/hooks";
import { switcher } from "~/App.tsx";
import { parsePsd } from "~/lib/psd.ts";
import { PopUp } from "~/layout/default.tsx";

export default function Home() {
  const setPopup = useContext(PopUp);

  const onFileSubmit = (files: FileList | null | undefined) => {
    if (!files) return;
    const file = files.item(0);
    if (!file) return;
    parsePsd(file).then((psd) => {
      switcher.switch("viewer", { psd });
    });
  };

  return (
    <div class="h-full w-full md:max-w-screen-md m-auto p-1 flex flex-col">
      <div></div>
      <div class="child-center flex-1">
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
          class="flex flex-col"
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
      <footer>
        <button
          onClick={() => {
            setPopup(<span>yo</span>, (e) => {
            });
          }}
          class="text-blue-500"
        >
          credit
        </button>
      </footer>
    </div>
  );
}
