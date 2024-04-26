import $ from "https://deno.land/x/dax@0.39.1/mod.ts";
import { Builder, BuilderOptions } from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.0/src/mod.ts";
import tailwindcss from "npm:tailwindcss";
import postCssPlugin from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.0/plugins/postCssPlugin.ts";
import tailwindConfig from "./tailwind.config.js";

const mode = Deno.args.at(0);
if (mode === undefined) {
    throw new Error("no mode was provided");
}

const options: BuilderOptions = {
    documentFilePath: "./src-ui/index.html",
    denoConfigPath: "./deno.json",
    outdir: "./artifacts/dist",
    outbase: "./src-ui",
    serve: {
        watch: ["./src-ui"]
    },
    loader: {},
    esbuildPlugins: [
        postCssPlugin({
            plugins: [
                tailwindcss(tailwindConfig)
            ]
        })
    ]
};

const builder = new Builder(options);

switch (mode) {
    case "gen": {
        await generate();
        break;
    }
    case "serve": {
        await generate();
        await builder.serve();
        break;
    }
    case "build": {
        await generate();
        await builder.build();
        break;
    }
}

async function generate() {
    const targetDir = `${import.meta.dirname}/artifacts/generated`;
    await $`wasm-pack build ./crates/psdapp --mode no-install --target web -d ${targetDir}`;

}