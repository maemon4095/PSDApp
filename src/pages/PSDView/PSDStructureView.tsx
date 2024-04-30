import { ComponentChildren, Fragment, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import Psd, { Group as RawGroup, Layer, NodeChild } from "psd";

type Group =
  & {
    [p in keyof RawGroup]: RawGroup[p];
  }
  & HasLayerFrame;

type HasLayerFrame = {
  layerFrame: HasLayerProperties;
};

type HasLayerProperties = {
  layerProperties: LayerProperties;
};

type LayerProperties = {
  name: string;
  hidden: boolean;
};

export default function PsdStrucutureView(
  { roots }: { roots: NodeChild[] },
) {
  return (
    <ul class="[&_ul>li]:ml-4 min-w-max">
      <PsdStrucutureTree roots={roots} />
    </ul>
  );
}

function PsdStrucutureTree(
  { roots }: { roots: NodeChild[] },
) {
  const items = useMemo(() => roots.map((e) => <Entry elem={e} />), [roots]);

  return (
    <>
      {items}
    </>
  );
}

function Entry({ elem }: { elem: NodeChild }) {
  const entry = elem.type === "Group"
    ? <GroupEntry group={elem as unknown as Group} />
    : <LayerEntry layer={elem} />;

  return (
    <li>
      {entry}
    </li>
  );
}

function LayerEntry({ layer }: { layer: Layer }) {
  const [visible, setVisible] = useState(!layer.isHidden);
  const indicator = (
    <input
      type="checkbox"
      checked={visible}
      onClick={(e) => e.stopPropagation()}
      onInput={() => setVisible((e) => !e)}
    />
  );
  return (
    <HeaderContainer
      indicator={indicator}
      onClick={() => setVisible((e) => !e)}
    >
      <span
        data-hidden={!visible}
        class="flex flex-row items-center gap-1 attrhide "
      >
        <canvas src="" class="border size-4" />
        <span>{layer.name}</span>
      </span>
    </HeaderContainer>
  );
}

function GroupEntry({ group }: { group: Group & HasLayerFrame }) {
  console.log(group);

  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(
    !group.layerFrame.layerProperties.hidden,
  );
  const buttonIcon = collapsed ? "▶" : "▼";
  return (
    <>
      <HeaderContainer
        indicator={buttonIcon}
        onClick={() => setCollapsed((e) => !e)}
      >
        <button
          data-hidden={!visible}
          onClick={(e) => {
            e.stopPropagation();
            setVisible((e) => !e);
          }}
          class="border px-1 bg-white attrhide"
        >
          <img src=""></img>
          <span>{group.name}</span>
        </button>
      </HeaderContainer>
      <ul
        hidden={collapsed}
        data-hidden={!visible}
        class="attrhide pointer-none-on-attrhide"
      >
        <PsdStrucutureTree roots={group.children} />
      </ul>
    </>
  );
}

function HeaderContainer(
  { indicator, children, onClick }: {
    indicator: ComponentChildren;
    children: ComponentChildren;
    onClick?: () => void;
  },
) {
  return (
    <button
      onClick={() => onClick?.()}
      class="flex flex-row items-center border -mb-px bg-stone-50 p-1 w-full"
    >
      <span class="size-4 mr-1 grid place-content-center pointer-events-none">
        {indicator}
      </span>
      {children}
    </button>
  );
}
