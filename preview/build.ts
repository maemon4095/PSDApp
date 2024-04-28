import { Builder, BuilderOptions } from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.3/src/mod.ts";
import tailwindcss from "npm:tailwindcss";
import postCssPlugin from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.3.3/plugins/postCssPlugin.ts";
import tailwindConfig from "../tailwind.preview.config.js";

const options = {
    documentFilePath: resolve("./index.html"),
    denoConfigPath: resolve("../deno.json"),
    outdir: resolve("./dist"),
    clearDistDir: true,
    treeShaking: true,
    serve: {
        watch: [resolve("../src"), resolve("./src")]
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

await builder.serve();

function resolve(s: string) {
    const p = import.meta.resolve(s);
    return p.replace("file:///", "");
}