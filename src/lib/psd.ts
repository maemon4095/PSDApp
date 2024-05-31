export {
    type PhotoshopNode, type Layer, type Group,
    render
} from "psd";
import type { Photoshop as Psd } from "psd";
// @deno-types=@loader-types/file.d.ts
import workerPath from "./psd.worker.ts";

const worker = new Worker(workerPath);

export async function parse(buffer: ArrayBuffer) {
    return await new Promise<Psd>(resolve => {
        const listener = (e: MessageEvent) => {
            switch (e.data.type as string) {
                case "done": {
                    worker.removeEventListener("message", listener);
                    resolve(e.data.photoshop);
                    break;
                }
            }
        };
        worker.addEventListener("message", listener);

        worker.postMessage({ type: "parse", buffer });
    });
}

export type { Psd };