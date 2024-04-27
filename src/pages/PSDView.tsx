import { Fragment, h } from "preact";
import { switcher } from "~/App.tsx";

export default function PSDView({ file }: { file: File }) {
  if (file === undefined) {
    switcher.switch("home");
    return <></>;
  }

  console.log(file);
  return <div></div>;
}
