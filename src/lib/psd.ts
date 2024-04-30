import { unbounded } from "https://raw.githubusercontent.com/maemon4095/ts_components/release/v0.4.0/channel/mod.ts";
import { unsafeAssertType } from "~/lib/utils/mod.ts";

// @deno-types="../../artifacts/generated/psdapp.d.ts"
import * as mod from "../../artifacts/generated/psdapp.js";
await mod.default();

export type PsdLayerProps = {
    name: string,
    layer_top: number,
    layer_left: number,
    layer_bottom: number,
    layer_right: number,
    visible: boolean,
    opacity: number,
    is_clipping_mask: boolean,
    parent_id: null | number;
    blend_mode: number,
};

export type PsdGroupProps = {
    id: number;
} & PsdLayerProps;

type ProgressListener = (progress: number, status: string) => void;

export async function init(bytes: Uint8Array) {
    await mod.init(bytes);
}

export function getLayers() {
    const [sender, receiver] = unbounded<PsdLayerProps | undefined>();
    const yielding = mod.get_layers((e: PsdLayerProps | undefined) => {
        sender.send(e);
    });

    async function* gen() {
        while (true) {
            const value = await receiver.receive();
            if (value === undefined) break;
            yield value;
        }
        await yielding;
    };
    return gen();
}

export function getGroups() {
    const [sender, receiver] = unbounded<PsdGroupProps | undefined>();
    const yielding = mod.get_groups((e: PsdGroupProps | undefined) => {
        sender.send(e);
    });

    async function* gen() {
        while (true) {
            const value = await receiver.receive();
            if (value === undefined) break;
            yield value;
        }
        await yielding;
    };
    return gen();
}

export type PsdGroupOrLayer =
    | { type: "group", value: PsdGroup; }
    | { type: "layer", value: PsdLayerProps; };

export type PsdGroup = PsdGroupProps & { children: PsdGroupOrLayer[]; };

export type PsdStructure = {
    readonly groups: Map<number, PsdGroup>,
    readonly layers: PsdLayerProps[];
    readonly roots: PsdGroupOrLayer[];
};

export type PsdProfile = {
    width: number;
    height: number;
    color_mode: number;
    depth: number;
};

// combinable progress
export async function getPsdStructure(progress?: ProgressListener): Promise<PsdStructure> {
    progress?.(0, "Start loading PSD structure.");
    const layer_count = mod.get_layer_count();
    const group_count = mod.get_group_count();
    const total = layer_count + group_count;
    let loaded = 0;
    progress?.(0, `Found ${layer_count} layers and ${group_count} groups.`);
    const [groups, roots] = await (async () => {
        const groups = new Map<number, PsdGroup | { children: PsdGroupOrLayer[]; }>();
        const roots: PsdGroupOrLayer[] = [];
        for await (const g of getGroups()) {
            loaded += 1;
            progress?.(loaded / total, `Loading groups: ${loaded} of ${group_count}.`);
            let group = groups.get(g.id);
            if (group === undefined) {
                group = { ...g, children: [] } as PsdGroup;
                groups.set(g.id, group);
            } else {
                // children registered before load
                Object.assign(group, g);
            }
            unsafeAssertType<PsdGroup>(group);

            const me: PsdGroupOrLayer = { type: "group", value: group };
            if (group.parent_id === null) {
                // the group is root
                roots.push(me);
                continue;
            }
            // the group is not root and register itself to parent's children
            const parent = groups.get(group.parent_id);
            if (parent === undefined) {
                // parent group is not loaded
                groups.set(group.parent_id, { children: [me] });
            } else {
                parent.children.push(me);
            }

        }
        // todo: add check for group that parent_id is not undefined but parent does not exists.

        return [groups as Map<number, PsdGroup>, roots];
    })();

    const layers: PsdLayerProps[] = [];
    for await (const layer of getLayers()) {
        loaded += 1;
        progress?.(loaded / total, `Loading layers: ${layers.length + 1} of ${layer_count}.`);
        layers.push(layer);
        const me: PsdGroupOrLayer = { type: "layer", value: layer };
        if (layer.parent_id === null) {
            roots.push(me);
        } else {
            const parent = groups.get(layer.parent_id);
            if (parent === undefined) {
                console.warn("parent group was not exists.");
                continue;
            }
            parent.children.push(me);
        }
    }

    progress?.(1, "Done loading PSD structure.");

    return { groups, layers, roots };
}

export function getPsdProfile() {
    return mod.get_psd_profile() as PsdProfile;
}

export function getLayerVisibility(name: string) {
    return mod.get_layer_visibility(name);
}

export function getGroupVisibility(id: number) {
    return mod.get_group_visibility(id);
}

export function drawInto(canvas: HTMLCanvasElement) {
    mod.draw_into(canvas);
}