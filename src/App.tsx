import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { greet } from "./lib/psd.ts";

export default function App() {
  const [text, setText] = useState();
  useEffect(() => {
    greet("aaa");
  }, []);
  return <div>{text}</div>;
}
