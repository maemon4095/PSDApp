import {
  Attributes,
  Component,
  ComponentChild,
  ComponentChildren,
  Fragment,
  h,
  Ref,
} from "preact";
import Home from "~/pages/Home.tsx";
import PSDView from "~/pages/PSDView.tsx";
import { createSwitcher } from "~/components/Switcher.tsx";

const routes = {
  home: Home,
  viewer: PSDView,
} as const;

const [Switcher, switcher] = createSwitcher(routes);

export { switcher };

export default function App() {
  return <Switcher initialPath="home" />;
}
