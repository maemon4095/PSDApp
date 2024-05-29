import { parse } from "psd";

onmessage = (e) => {
    switch (e.data.type as string) {
        case "parse": {
            const buffer = e.data.buffer as ArrayBuffer;
            const photoshop = parse(buffer, { skipImageDataSection: true });
            postMessage({ type: "done", photoshop });
            break;
        }
    }
}; 