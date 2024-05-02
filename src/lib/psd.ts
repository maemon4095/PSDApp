import * as psd from "npm:@webtoon/psd";
import RawPSD from "npm:@webtoon/psd";

export type Psd = {
    readonly width: number;
    readonly height: number;
    readonly layers: Layer[];
    readonly groups: Group[];
    readonly children: (Layer | Group)[];
};

export type Layer = {
    readonly type: "Layer";
    readonly name: string;
    readonly parent: Group | undefined;
    readonly width: number;
    readonly height: number;
    readonly left: number;
    readonly top: number;
    readonly order: number;
    visible: boolean;
    composite(effect?: boolean, composed?: boolean): Promise<Uint8ClampedArray>;
};

export type Group = {
    readonly type: "Group";
    readonly name: string;
    readonly parent: Group | undefined;
    readonly children: (Layer | Group)[];
    visible: boolean;
};

export function parsePsd(buffer: ArrayBuffer): Psd {
    const psd = RawPSD.parse(buffer);
    const width = psd.width;
    const height = psd.height;
    const layers: Layer[] = [];
    const groups: Group[] = [];
    const layerOrderMap = createLayerOrderMap(psd);
    const children = psd.children.map(e => convertNode(e, layerOrderMap, layers, groups));
    layers.sort((l, r) => l.order - r.order);

    return {
        width,
        height,
        children,
        layers,
        groups
    };
}

type Writable<T> = { -readonly [p in keyof T]: T[p] };

function convertNode(node: psd.NodeChild, layer_order: Map<psd.Layer, number>, layers_collect: Layer[], groups_collect: Group[]): Writable<Group> | Writable<Layer> {
    switch (node.type) {
        case "Group": {
            // PATCH: currently there are no public accessor for group visibility
            const dummy = node as unknown as { layerFrame: { layerProperties: { hidden: boolean; }; }; };
            const children: (Group | Layer)[] = [];
            const me: Writable<Group> = {
                type: "Group",
                name: node.name,
                visible: !dummy.layerFrame.layerProperties.hidden,
                parent: undefined,
                children
            };

            for (const childNode of node.children) {
                const child = convertNode(childNode, layer_order, layers_collect, groups_collect);
                children.push(child);
                child.parent = me as Group;
            }

            groups_collect.push(me);
            return me;
        }
        case "Layer": {
            const me: Writable<Layer> = {
                type: "Layer",
                name: node.name,
                parent: undefined,
                width: node.width,
                height: node.height,
                left: node.left,
                top: node.top,
                order: layer_order.get(node)!,
                visible: !node.isHidden,
                async composite(effect, composed) {
                    return await node.composite(effect, composed);
                }
            };
            layers_collect.push(me);
            return me;
        }
    }
}

function createLayerOrderMap(psd: RawPSD) {
    const map = new Map<psd.Layer, number>();
    for (let i = 0; i < psd.layers.length; ++i) {
        const layer = psd.layers[i];
        map.set(layer, i);
    }
    return map;
}