import { useEffect, useState } from "preact/hooks";
import type {
  PsdServer,
  PsdStructureGroup,
  PsdStructureLayer,
  PsdStructureRoot,
} from "~/lib/psd.ts";
import { useSelection } from "../../hooks/useSelection.ts";

type GroupMode = "multiple" | "choice";

export default function PsdStrucutureView(
  { server, psdStructure }: {
    server: PsdServer;
    psdStructure: PsdStructureRoot;
  },
) {
  return (
    <RootEntry
      mode="multiple"
      server={server}
      {...psdStructure}
    />
  );
}

type EntryProps = {
  server: PsdServer;
  mode: GroupMode;
  groupId: number | string;
  setVisible: (visible: boolean) => void;
};

function Entry(
  props: EntryProps & (PsdStructureGroup | PsdStructureLayer),
) {
  switch (props.type) {
    case "Group":
      return <GroupEntry {...props} />;
    case "Layer":
      return <LayerEntry {...props} />;
  }
}

function RootEntry({ id, server, mode, children }: {
  server: PsdServer;
  mode: GroupMode;
} & PsdStructureRoot) {
  const [selection, select, unselect, setLimit] = useSelection(
    () => Object.fromEntries(children.map((e) => [e.id, e.visible])),
    mode === "choice" ? 1 : undefined,
  );

  switch (mode) {
    case "multiple":
      setLimit(undefined);
      break;
    case "choice":
      setLimit(1);
      break;
  }

  useEffect(() => {
    server.update(
      ...Object
        .entries(selection).map((
          [key, visible],
        ) => ([Number(key), { visible }] as const)),
    );
  }, [selection]);

  return (
    <ul class="[&_ul>li]:ml-4 min-w-max select-none">
      {children.map((node) => (
        <Entry
          {...node}
          key={node.id}
          mode={mode}
          groupId={id}
          server={server}
          visible={selection[node.id]}
          setVisible={(v) => v ? select(node.id) : unselect(node.id)}
        />
      ))}
    </ul>
  );
}

function LayerEntry(
  { groupId, name, mode, visible, setVisible }:
    & EntryProps
    & PsdStructureLayer,
) {
  return (
    <li class="psd-node" data-selected={visible}>
      <div class="psd-entry">
        <label class="flex flex-row gap-1 psd-entry-label">
          <input
            type={mode == "multiple" ? "checkbox" : "radio"}
            checked={visible}
            name={`psd-group-${groupId}`}
            onClick={(e) => {
              e.stopPropagation();
              setVisible(e.currentTarget.checked);
            }}
          />

          <span class="border px-1 bg-white">{name}</span>
        </label>
      </div>
    </li>
  );
}

function GroupEntry(
  { server, id, groupId, mode, visible, children, name, setVisible }:
    & EntryProps
    & PsdStructureGroup,
) {
  const [collapsed, setCollapsed] = useState(!visible);
  const [childMode, setChildMode] = useState<GroupMode>("multiple");
  const [selection, select, unselect, setLimit] = useSelection(
    () => Object.fromEntries(children.map((e) => [e.id, e.visible])),
    mode === "choice" ? 1 : undefined,
  );

  useEffect(() => {
    server.update(
      ...Object
        .entries(selection).map((
          [key, visible],
        ) => ([Number(key), { visible }] as const)),
    );
  }, [selection]);

  return (
    <li class="psd-node" data-selected={visible}>
      <div
        class="psd-entry"
        onClick={() => setCollapsed((e) => !e)}
      >
        <PsdGroupToggle
          collapsed={collapsed}
          onChange={setCollapsed}
        />
        <label
          onClick={(e) => e.stopPropagation()}
          class="flex flex-row gap-1 psd-entry-label"
        >
          <input
            type={mode == "multiple" ? "checkbox" : "radio"}
            name={`psd-group-${groupId}`}
            onChange={(e) => {
              e.stopPropagation();
              setVisible(e.currentTarget.checked);
            }}
            checked={visible}
          />
          <span class="border px-1 bg-white">{name}</span>
        </label>

        <label
          class="ml-auto has-[:focus]:outline rounded outline-2 has-[:checked]:opacity-100 opacity-30"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            class="opacity-0 size-0 absolute"
            onChange={(e) => {
              if (e.currentTarget.checked) {
                setLimit(1);
                setChildMode("choice");
              } else {
                setLimit(undefined);
                setChildMode("multiple");
              }
            }}
          />
          <span class="border px-1 bg-white">択一</span>
        </label>
      </div>
      <ul
        hidden={collapsed}
        inert={!visible}
        class="pointer-none-when-not-selected"
      >
        {children.map((node) => (
          <Entry
            {...node}
            mode={childMode}
            key={node.id}
            groupId={id}
            server={server}
            visible={selection[node.id]}
            setVisible={(v) => v ? select(node.id) : unselect(node.id)}
          />
        ))}
      </ul>
    </li>
  );
}

function PsdGroupToggle(
  { collapsed: collapsed, onChange }: {
    collapsed: boolean;
    onChange: (collapsed: boolean) => void;
  },
) {
  const icon = collapsed ? "▶" : "▼";

  return (
    <label
      class="has-[:focus]:outline rounded outline-2"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={!collapsed}
        onChange={(e) => onChange(!e.currentTarget.checked)}
        class="opacity-0 size-0 absolute"
      />
      <span>
        {icon}
      </span>
    </label>
  );
}
