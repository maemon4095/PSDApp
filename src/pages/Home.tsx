import { h } from "preact";
import { switcher } from "~/App.tsx";
import { parsePsd } from "~/lib/psd.ts";

export default function Home() {
  const onFileSubmit = (files: FileList | null | undefined) => {
    if (!files) return;
    const file = files.item(0);
    if (!file) return;

    file.arrayBuffer().then((f) => {
      const psd = parsePsd(f);
      switcher.switch("viewer", { psd });
    });
  };

  return (
    <div class="size-full p-1 flex justify-center items-center">
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
  );
}
