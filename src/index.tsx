import "./types/meta.d.ts";
import { render } from "preact";
import App from "./App.tsx";
// @deno-types=@loader-types/file.d.ts
import worker from "./service.worker.ts";

if (!import.meta.isDev) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(worker, { scope: "." });
  }
}
render(
  <App />,
  document.body,
);
