import $ from "https://deno.land/x/dax@0.39.1/mod.ts";
import { Builder, BuilderOptions } from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.0/src/mod.ts";
import tailwindcss from "npm:tailwindcss";
import postCssPlugin from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.0/plugins/postCssPlugin.ts";
import tailwindConfig from "./tailwind.config.js";

const mode = Deno.args.at(0);
if (mode === undefined) {
    throw new Error("no mode was provided");
}
const artifactsDir = `${import.meta.dirname}/artifacts`;
const distDir = `${artifactsDir}/dist`;
const genDir = `${artifactsDir}/generated`;

const options: BuilderOptions = {
    documentFilePath: "./src/index.html",
    denoConfigPath: "./deno.json",
    outdir: distDir,
    outbase: "./src",
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
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
    const scriptFileName = "psdapp";
    await $`wasm-pack build ./crates/psdapp --mode no-install --target web --out-name ${scriptFileName} -d ${genDir}`;

    const scriptFilePath = `${genDir}/${scriptFileName}.js`;
    const wasmFilePath = `${scriptFileName}_bg.wasm`;
    let scriptText = await Deno.readTextFile(scriptFilePath);
    scriptText = `import __wasmFilePath from './${wasmFilePath}';\n${scriptText}`;
    scriptText = scriptText.replaceAll(`new URL('${wasmFilePath}', import.meta.url)`, "__wasmFilePath");
    await Deno.writeTextFile(scriptFilePath, scriptText);
}