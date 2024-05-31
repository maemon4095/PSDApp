import { parse } from "psd/mod.ts";

onmessage = (e) => {
    switch (e.data.type as string) {
        case "parse": {
            const buffer = e.data.buffer as ArrayBuffer;
            const photoshop = parse(buffer);
            postMessage({ type: "done", photoshop });
            break;
        }
    }
}; 