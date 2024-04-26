import { h } from "preact";
import { route } from "preact-router";

export default function Home() {
  const onFileSubmit = (files: FileList | null | undefined) => {
    if (!files) return;
    const file = files.item(0);
    if (!file) return;

    const url = URL.createObjectURL(file);
    route(`/viewer/${encodeURIComponent(url)}`);
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
          accept=".psd"
          onInput={(e) => onFileSubmit(e.currentTarget.files)}
        >
        </input>
        <p>ここにファイルをドロップ</p>
      </div>
    </div>
  );
}
