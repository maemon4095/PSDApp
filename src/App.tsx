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

const paths = {
  home: Home,
  viewer: PSDView,
} as const;

const [Switcher, switcher] = createSwitcher(paths);

export { switcher };

export default function App() {
  return <Switcher path="home" />;
}
