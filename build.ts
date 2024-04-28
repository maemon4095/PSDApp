import $ from "https://deno.land/x/dax@0.39.1/mod.ts";
import { Builder, BuilderOptions } from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.0/src/mod.ts";
import tailwindcss from "npm:tailwindcss";
import postCssPlugin from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.0/plugins/postCssPlugin.ts";
import tailwindConfig from "./tailwind.config.js";
import { parseArgs } from "https://deno.land/std@0.221.0/cli/mod.ts";

const args = parseArgs(Deno.args, {
    "boolean": ["dev"]
});
const mode = args._[0];
const is_dev = args.dev;
if (mode === undefined) {
    throw new Error("no mode was provided");
}

switch (mode) {
    case "gen":
    case "serve":
    case "build": break;
    default: {
        console.log(`unrecognized mode: ${mode}`);
        Deno.exit(1);
    }
}

const artifactsDir = `${import.meta.dirname}/artifacts`;
const distDir = `${artifactsDir}/dist`;
const genDir = `${artifactsDir}/generated`;

if (mode === "gen") {
    generate(is_dev);
    Deno.exit();
}

const options = {
    documentFilePath: "./src/index.html",
    denoConfigPath: "./deno.json",
    outdir: distDir,
    clearDistDir: true,
    treeShaking: true,
    serve: {
        watch: ["./src", "./crates"]
    },
    loader: {
        ".wasm": "file"
    },
    esbuildPlugins: [
        postCssPlugin({
            plugins: [
                tailwindcss(tailwindConfig)
            ]
        }),
        {
            name: "rust bundle",
            setup(build) {
                build.onStart(async () => {
                    await generate(is_dev);
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

async function generate(dev: boolean) {
    const scriptFileName = "psdapp";
    const profile = dev ? "--dev" : "--release";
    await $`wasm-pack build ./crates/psdapp ${profile} --mode no-install --target web --out-name ${scriptFileName} -d ${genDir}`;

    const scriptFilePath = `${genDir}/${scriptFileName}.js`;
    const wasmFilePath = `${scriptFileName}_bg.wasm`;
    let scriptText = await Deno.readTextFile(scriptFilePath);
    scriptText = `import __wasmFilePath from './${wasmFilePath}';\n${scriptText}`;
    scriptText = scriptText.replaceAll(`new URL('${wasmFilePath}', import.meta.url)`, "__wasmFilePath");
    await Deno.writeTextFile(scriptFilePath, scriptText);
}