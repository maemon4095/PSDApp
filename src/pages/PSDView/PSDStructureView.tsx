import type { ComponentChildren } from "preact";
import { useReducer, useState } from "preact/hooks";
import {
  PsdServer,
  type PsdStructureGroup,
  type PsdStructureLayer,
  type PsdStructureNode,
} from "~/lib/psd.ts";

export default function PsdStrucutureView(
  { psdStructure }: { psdStructure: PsdStructureNode },
) {
  return <Entry node={psdStructure} />;
}

function Entry(
  { node }: { node: PsdStructureNode },
) {
  switch (node.type) {
    case "Photoshop":
      return (
        <ul class="[&_ul>li]:ml-4 min-w-max">
          {node.children.map((node) => <Entry node={node} />)}
        </ul>
      );
    case "Group":
      return <GroupEntry group={node} />;
    case "Layer":
      return <LayerEntry layer={node} />;
  }
}

function LayerEntry(
  { layer }: { layer: PsdStructureLayer },
) {
  const [visible, toggleVisible] = useReducer(
    (old: boolean, _: void): boolean => {
      layer.visible = !old;
      PsdServer.instance.update(layer.id, { visible: layer.visible });
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

function GroupEntry(
  { group }: { group: PsdStructureGroup },
) {
  const [collapsed, setCollapsed] = useState(!group.visible);
  const [visible, toggleVisible] = useReducer(
    (old: boolean, _: void): boolean => {
      group.visible = !old;
      PsdServer.instance.update(group.id, { visible: !old });
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
        {group.children.map((e) => <Entry node={e} />)}
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
