import { Fragment, h } from "preact";
import { switcher } from "~/App.tsx";
import { getLayers, init } from "~/lib/psd.ts";
import { useEffect } from "preact/hooks";

export default function PSDView({ file }: { file: File }) {
  if (file === undefined) {
    switcher.switch("home");
    return <></>;
  }

  useEffect(() => {
    const f = async () => {
      const f = await file.arrayBuffer();
      await init(new Uint8Array(f));
      for await (const l of getLayers()) {
        console.log(l);
      }
    };
    f();
  }, []);

  return <div></div>;
}
