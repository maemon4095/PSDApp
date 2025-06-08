export type { Group, Layer, PhotoshopNode } from "psd/mod.ts";
import type {
  BlendMode,
  ClippingMode,
  ColorDepth,
  ColorMode,
  Photoshop as Psd,
  Version,
} from "psd/mod.ts";
export { createRenderer } from "psd/draw/mod.ts";
// @deno-types=@loader-types/file.d.ts
import workerPath from "./psd.worker.ts";

export class PsdServer {
  readonly #worker: Worker;

  constructor() {
    this.#worker = new Worker(workerPath);
  }

  async parse(buffer: ArrayBuffer) {
    await new Promise<void>((resolve) => {
      const id = Math.random();
      const worker = this.#worker;
      function listener(msg: MessageEvent) {
        const payload = msg.data as { type: string; id: number };
        if (payload.type !== "parse-done") return;
        if (payload.id !== id) return;
        worker.removeEventListener("message", listener);
        resolve();
      }
      worker.addEventListener("message", listener);
      worker.postMessage({ type: "parse", buffer, id }, [buffer]);
    });
  }

  async mount(canvas: OffscreenCanvas) {
    await new Promise<void>((resolve) => {
      const id = Math.random();
      const worker = this.#worker;
      function listener(msg: MessageEvent) {
        const payload = msg.data as { type: string; id: number };
        if (payload.type !== "mount-done") return;
        if (payload.id !== id) return;
        worker.removeEventListener("message", listener);
        resolve();
      }
      worker.addEventListener("message", listener);
      worker.postMessage({ type: "mount", canvas, id }, [canvas]);
    });
  }

  async unmount() {
    await new Promise<void>((resolve) => {
      const id = Math.random();
      const worker = this.#worker;
      function listener(msg: MessageEvent) {
        const payload = msg.data as { type: string; id: number };
        if (payload.type !== "unmount-done") return;
        if (payload.id !== id) return;
        worker.removeEventListener("message", listener);
        resolve();
      }
      worker.addEventListener("message", listener);
      worker.postMessage({ type: "unmount", id });
    });
  }

  async render() {
    await new Promise<void>((resolve) => {
      const id = Math.random();
      const worker = this.#worker;
      function listener(msg: MessageEvent) {
        const payload = msg.data as { type: string; id: number };
        if (payload.type !== "render-done") return;
        if (payload.id !== id) return;
        worker.removeEventListener("message", listener);
        resolve();
      }
      worker.addEventListener("message", listener);
      worker.postMessage({ type: "render", id });
    });
  }

  async update(
    ...pairs:
      readonly (readonly [number, Partial<PsdStructureConfigurableProps>])[]
  ) {
    await new Promise<void>((resolve) => {
      const requestId = Math.random();
      const worker = this.#worker;
      function listener(msg: MessageEvent) {
        const payload = msg.data as { type: string; id: number };
        if (payload.type !== "update-done") return;
        if (payload.id !== requestId) return;
        worker.removeEventListener("message", listener);
        resolve();
      }
      worker.addEventListener("message", listener);
      worker.postMessage({ type: "update", id: requestId, pairs });
    });
  }

  async getStructure() {
    return await new Promise<PsdStructureRoot | undefined>((resolve) => {
      const id = Math.random();
      const worker = this.#worker;
      function listener(msg: MessageEvent) {
        const payload = msg.data as {
          type: string;
          id: number;
          psd: PsdStructureRoot;
        };
        if (payload.type !== "getStructure-done") return;
        if (payload.id !== id) return;
        worker.removeEventListener("message", listener);
        resolve(payload.psd);
      }
      worker.addEventListener("message", listener);
      worker.postMessage({ type: "getStructure", id });
    });
  }
}

export type { Psd };

export type PsdStructureLayer = {
  type: "Layer";
} & PsdStructureProps;

export type PsdStructureGroup = {
  type: "Group";
  children: (PsdStructureGroup | PsdStructureLayer)[];
} & PsdStructureProps;

export type PsdStructureRoot = {
  type: "Photoshop";
  id: number;
  height: number;
  width: number;
  channelCount: number;
  colorDepth: ColorDepth;
  colorMode: ColorMode;
  version: Version;
  children: (PsdStructureGroup | PsdStructureLayer)[];
};

export type PsdStructureConfigurableProps = {
  name: string;
  visible: boolean;
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** 0 = transparent, 255 = opaque. */
  opacity: number;
  clippingMode: ClippingMode;
  blendMode: BlendMode;
};

type PsdStructureProps =
  & PsdStructureReadonlyProps
  & PsdStructureConfigurableProps;

type PsdStructureReadonlyProps = {
  readonly id: number;
};
export type PsdStructureNode =
  | PsdStructureLayer
  | PsdStructureGroup
  | PsdStructureRoot;
