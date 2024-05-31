import type { ComponentChildren } from "preact";
import { useReducer, useState } from "preact/hooks";
import type { Group, Layer, Psd } from "~/lib/psd.ts";

type Callbacks = {
  onChange: () => void;
};
type Node = Psd | Group | Layer;

export default function PsdStrucutureView(
  { psd, ...callbacks }: { psd: Node } & Callbacks,
) {
  return <Entry node={psd} {...callbacks} />;
}

function Entry(
  { node, ...callbacks }: { node: Node } & Callbacks,
) {
  switch (node.type) {
    case "Photoshop":
      return (
        <ul class="[&_ul>li]:ml-4 min-w-max">
          {node.children.map((node) => <Entry node={node} {...callbacks} />)}
        </ul>
      );
    case "Group":
      return <GroupEntry group={node} {...callbacks} />;
    case "Layer":
      return <LayerEntry layer={node} {...callbacks} />;
  }
}

function LayerEntry({ layer, onChange }: { layer: Layer } & Callbacks) {
  const [visible, toggleVisible] = useReducer(
    (old: boolean, e: void): boolean => {
      layer.visible = !old;
      onChange?.();
      return !old;
    },
    layer.visible,
  );

  const indicator = (
    <input
      type="checkbox"
      checked={visible}
      onClick={(e) => e.stopPropagation()}
      onInput={() => toggleVisible()}
    />
  );

  return (
    <li>
      <HeaderContainer
        indicator={indicator}
        onClick={() => toggleVisible()}
      >
        <span
          data-hidden={!visible}
          class="flex flex-row items-center gap-1 attrhide "
        >
          <span>{layer.name}</span>
        </span>
      </HeaderContainer>
    </li>
  );
}

function GroupEntry({ group, onChange }: { group: Group } & Callbacks) {
  const [collapsed, setCollapsed] = useState(!group.visible);
  const [visible, toggleVisible] = useReducer(
    (old: boolean, e: void): boolean => {
      group.visible = !old;
      onChange?.();
      return !old;
    },
    group.visible,
  );
  const buttonIcon = collapsed ? "▶" : "▼";

  return (
    <li>
      <HeaderContainer
        indicator={buttonIcon}
        onClick={() => setCollapsed((e) => !e)}
      >
        <button
          data-hidden={!visible}
          onClick={(e) => {
            e.stopPropagation();
            toggleVisible();
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
        {group.children.map((e) => <Entry node={e} onChange={onChange} />)}
      </ul>
    </li>
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
