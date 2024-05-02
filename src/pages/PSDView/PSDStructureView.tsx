import { ComponentChildren, Fragment, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { Group, Layer } from "~/lib/psd.ts";

type Callbacks = {
  onChange: () => void;
};

export default function PsdStrucutureView(
  { roots, ...callbacks }: { roots: (Layer | Group)[] } & Callbacks,
) {
  return (
    <ul class="[&_ul>li]:ml-4 min-w-max">
      <PsdStrucutureTree roots={roots} {...callbacks} />
    </ul>
  );
}

function PsdStrucutureTree(
  { roots, ...callbacks }: { roots: (Layer | Group)[] } & Callbacks,
) {
  const items = useMemo(
    () => roots.map((e) => <Entry elem={e} {...callbacks} />),
    [roots, callbacks],
  );

  return (
    <>
      {items}
    </>
  );
}

function Entry({ elem, ...callbacks }: { elem: Layer | Group } & Callbacks) {
  const entry = elem.type === "Group"
    ? <GroupEntry group={elem as unknown as Group} {...callbacks} />
    : <LayerEntry layer={elem} {...callbacks} />;

  return (
    <li>
      {entry}
    </li>
  );
}

function LayerEntry({ layer, onChange }: { layer: Layer } & Callbacks) {
  const [visible, rawSetVisible] = useState(layer.visible);
  const setVisible = (e: boolean) => {
    if (e === visible) {
      return;
    }
    rawSetVisible(e);
    layer.visible = e;
    onChange?.();
  };

  const indicator = (
    <input
      type="checkbox"
      checked={visible}
      onClick={(e) => e.stopPropagation()}
      onInput={() => setVisible(!visible)}
    />
  );

  return (
    <HeaderContainer
      indicator={indicator}
      onClick={() => setVisible(!visible)}
    >
      <span
        data-hidden={!visible}
        class="flex flex-row items-center gap-1 attrhide "
      >
        <span>{layer.name}</span>
      </span>
    </HeaderContainer>
  );
}

function GroupEntry({ group, onChange }: { group: Group } & Callbacks) {
  const [collapsed, setCollapsed] = useState(!group.visible);
  const [visible, rawSetVisible] = useState(group.visible);
  const buttonIcon = collapsed ? "▶" : "▼";
  const setVisible = (e: boolean) => {
    if (e === visible) {
      return;
    }
    rawSetVisible(e);
    group.visible = e;
    onChange?.();
  };

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
            setVisible(!visible);
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
        <PsdStrucutureTree roots={group.children} onChange={onChange} />
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
