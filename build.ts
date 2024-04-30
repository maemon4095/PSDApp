import { Builder, BuilderOptions } from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.0/src/mod.ts";
import tailwindcss from "npm:tailwindcss";
import postCssPlugin from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.0/plugins/postCssPlugin.ts";
import tailwindConfig from "./tailwind.config.js";

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
    documentFilePath: "./src/index.html",
    denoConfigPath: "./deno.json",
    outdir: "./dist",
    clearDistDir: true,
    treeShaking: true,
    serve: {
        watch: ["./src"]
    },
    loader: {
        ".wasm": "file"
    },
    esbuildPlugins: [
        postCssPlugin({
            plugins: [
                tailwindcss(tailwindConfig)
            ]
        })
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

