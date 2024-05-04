import { Builder, BuilderOptions } from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.3/src/mod.ts";
import tailwindcss from "npm:tailwindcss";
import postCssPlugin from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.3/plugins/postCssPlugin.ts";
import tailwindConfig from "./tailwind.config.js";
import * as path from "https://deno.land/std@0.224.0/path/mod.ts";

const mode = Deno.args[0];
switch (mode) {
    case "serve":
    case "build": break;
    case undefined: {
        throw new Error("no mode was provided");
    }
    default: {
        console.log(`unrecognized mode: ${mode}`);
        Deno.exit(1);
    }
}

const options = {
    documentFilePath: "./index.html",
    denoConfigPath: "./deno.json",
    outdir: "./dist",
    clearDistDir: true,
    sourceMap: mode !== "build",
    dropLabels: mode === "build" ? ["DEV"] : undefined,
    serve: {
        watch: ["./src"]
    },
    esbuildPlugins: [
        postCssPlugin({
            plugins: [
                tailwindcss(tailwindConfig)
            ]
        }),

        {
            name: "clone service worker",
            setup(build) {
                build.onEnd(async () => {
                    const outdir = build.initialOptions.outdir!;
                    const serviceWorkerPath = "./src-worker/worker.js";
                    await Deno.copyFile(serviceWorkerPath, path.join(outdir, path.basename(serviceWorkerPath)));
                });
            }
        }
    ]
} satisfies BuilderOptions;
const builder = new Builder(options);

switch (mode) {
    case "serve": {
        await builder.serve();
        break;
    }
    case "build": {
        await builder.build();
        break;
    }
}

