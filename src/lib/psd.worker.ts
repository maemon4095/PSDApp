import { parse, type Photoshop } from "psd/mod.ts";
import { createRenderer, type Renderer } from "psd/draw/mod.ts";
import type {
  Group,
  Layer,
  PsdStructureGroup,
  PsdStructureLayer,
  PsdStructureRoot,
} from "~/lib/psd.ts";
import type { Removed } from "~/lib/utils/mod.ts";
import type { Optional } from "~/lib/utils/mod.ts";
import { unsafeAssertType } from "~/lib/utils/mod.ts";
import type { Mutable } from "~/lib/utils/mod.ts";

let canvasRendererPair: {
  context: OffscreenCanvasRenderingContext2D;
  renderer: Renderer;
} | undefined;
let psdPair: { root: PsdRoot; map: (PsdLayer | PsdGroup)[] } | undefined;

function render() {
  const { context, renderer } = canvasRendererPair!;
  const data = renderer.render(psdPair!.root, 0, 0);
  context.putImageData(data, 0, 0);
}

onmessage = (e) => {
  switch (e.data.type as string) {
    case "parse": {
      const id: number = e.data.id;
      const buffer: ArrayBuffer = e.data.buffer;

      psdPair = assignId(parse(buffer));

      if (canvasRendererPair !== undefined) render();

      postMessage({ type: "parse-done", id });

      break;
    }

    case "update": {
      const id: number = e.data.id;
      if (psdPair === undefined) {
        postMessage({ type: "update-done", id });
        return;
      }
      const nodeId: number = e.data.nodeId;
      const { map } = psdPair;

      Object.assign(map[nodeId], e.data.props);

      if (canvasRendererPair !== undefined) render();

      postMessage({ type: "update-done", id });
      break;
    }
    case "mount": {
      const id: number = e.data.id;
      const canvas: OffscreenCanvas = e.data.canvas;
      canvasRendererPair = {
        context: canvas.getContext("2d")!,
        renderer: createRenderer(canvas.width, canvas.height),
      };

      if (psdPair !== undefined) render();

      postMessage({ type: "mount-done", id });

      break;
    }

    case "unmount": {
      const id: number = e.data.id;
      canvasRendererPair = undefined;
      postMessage({ type: "unmount-done", id });
      break;
    }

    case "render": {
      const id: number = e.data.id;
      if (canvasRendererPair === undefined || psdPair === undefined) {
        return;
      }

      render();
      postMessage({ type: "render-done", id });
      break;
    }

    case "getStructure": {
      const id: number = e.data.id;
      if (psdPair === undefined) {
        postMessage({ type: "getStructure-done", id });
        break;
      }

      postMessage({
        type: "getStructure-done",
        id,
        psd: getStructure(psdPair.root),
      });
      break;
    }

    default:
      throw new Error("invalid message type");
  }
};

type PsdRoot = Photoshop & {
  children: (PsdLayer | PsdGroup)[];
};
type PsdLayer = Layer & {
  readonly id: number;
};
type PsdGroup = Group & {
  children: (PsdLayer | PsdGroup)[];
  readonly id: number;
};

function assignId(
  psd: Photoshop,
): { root: PsdRoot; map: (PsdLayer | PsdGroup)[] } {
  const map: (PsdLayer | PsdGroup)[] = [];
  function assign(layerOrGroup: Layer | Group): PsdLayer | PsdGroup {
    const id = map.length;
    switch (layerOrGroup.type) {
      case "Layer": {
        unsafeAssertType<Mutable<PsdLayer>>(layerOrGroup);
        map.push(layerOrGroup);
        layerOrGroup.id = id;
        return layerOrGroup;
      }
      case "Group": {
        unsafeAssertType<Mutable<PsdGroup>>(layerOrGroup);
        map.push(layerOrGroup);
        layerOrGroup.id = id;
        layerOrGroup.children = layerOrGroup.children.map((e) => assign(e));
        return layerOrGroup;
      }
    }
  }

  const root: PsdRoot = {
    ...psd,
    children: [],
  };

  root.children = psd.children.map((e) => assign(e));

  return { root, map };
}

function getStructure(psd: PsdRoot): PsdStructureRoot {
  function visit(
    layerOrGroup: PsdLayer | PsdGroup,
  ): PsdStructureLayer | PsdStructureGroup {
    switch (layerOrGroup.type) {
      case "Layer": {
        const layer: Optional<
          PsdLayer,
          "additionalInformations" | "imageData" | "parent"
        > = { ...layerOrGroup };

        delete layer["additionalInformations"];
        delete layer["imageData"];
        delete layer["parent"];

        return layer as PsdStructureLayer;
      }
      case "Group": {
        // deno-lint-ignore no-explicit-any
        const group: any = { ...layerOrGroup };
        delete group["additionalInformations"];
        delete group["imageData"];
        delete group["parent"];
        delete group["children"];

        group.children = (layerOrGroup.children as (PsdLayer | PsdGroup)[]).map(
          (e) => visit(e),
        );
        return group as PsdStructureGroup;
      }
    }
  }

  const root: Partial<PsdStructureRoot> = (() => {
    const tmp: Removed<Partial<Photoshop>, "children"> = { ...psd };
    delete tmp["additionalLayerInformations"];
    delete tmp["imageData"];
    delete tmp["imageResources"];
    delete tmp["layers"];
    return tmp;
  })();

  root.children = (psd.children as (PsdLayer | PsdGroup)[]).map((e) =>
    visit(e)
  );

  return root as PsdStructureRoot;
}
