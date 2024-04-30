import { useEffect, useState } from "preact/hooks";
import { Fragment, h } from "preact";
import { switcher } from "~/App.tsx";
import Progress from "~/components/Progress.tsx";
import Psd from "psd";

export default function Home() {
  const [popup, setPopup] = useState(<></>);
  const onFileSubmit = (files: FileList | null | undefined) => {
    if (!files) return;
    const file = files.item(0);
    if (!file) return;

    setPopup(<LoadingPopup file={file} />);
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
      {popup}
    </div>
  );
}

function LoadingPopup({ file }: { file: File }) {
  const [[progress, status], setProgress] = useState([0, ""]);
  useEffect(() => {
    (async () => {
      const f = await file.arrayBuffer();
      const psd = Psd.parse(f);
      switcher.switch("viewer", { psd });
    })();
  }, []);
  return (
    <div class="popup-bg">
      <div class="w-[50vw] p-2 border bg-slate-200 rounded shadow">
        <Progress progress={progress} status={status}></Progress>
      </div>
    </div>
  );
}
