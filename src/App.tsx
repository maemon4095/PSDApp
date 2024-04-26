import { h } from "preact";
// @deno-types="./@types/preact-router.d.ts"
import Router from "preact-router";
import Home from "~/pages/Home.tsx";
import PSDView from "~/pages/PSDView.tsx";

export default function App() {
  return (
    <Router>
      <Home path="/"></Home>
      <PSDView path="/viewer/:blob"></PSDView>
    </Router>
  );
}
