import { unbounded } from "https://raw.githubusercontent.com/maemon4095/ts_components/release/v0.4.0/channel/mod.ts";

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
    parent_id: undefined | number;
};

export type PsdGroupProps = {
    id: number;
} & PsdLayerProps;

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