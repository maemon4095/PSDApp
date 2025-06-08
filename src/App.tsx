import Home from "~/pages/Home/mod.tsx";
import PSDView from "~/pages/PSDView/mod.tsx";
import { createSwitcher } from "~/lib/switcher.ts";
import Layout from "~/layouts/default.tsx";
const paths = {
  home: Home,
  viewer: PSDView,
} as const;

const [Switcher, switcher] = createSwitcher(paths);

export { switcher };

export default function App() {
  return (
    <Layout>
      <Switcher path="home" />
    </Layout>
  );
}
