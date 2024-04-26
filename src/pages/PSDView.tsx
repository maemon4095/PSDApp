import { Fragment, h } from "preact";
import { route } from "preact-router";

export default function PSDView({ blob }: { blob?: string }) {
  if (blob === undefined) {
    route("/");
    return <></>;
  }

  fetch(blob).then(async (e) => await e.blob()).then((b) => {
    console.log(b);
  });
  return <div></div>;
}
