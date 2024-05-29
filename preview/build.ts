import { Builder, BuilderOptions } from "file:///C:/Users/maemon/repos/deno-esbuilder/src/mod.ts";
import tailwindcss from "npm:tailwindcss";
import postCssPlugin from "file:///C:/Users/maemon/repos/deno-esbuilder/plugins/postCssPlugin.ts";
import tailwindConfig from "../tailwind.preview.config.js";

const options = {
    documentFilePath: resolve("./index.html"),
    denoConfigPath: resolve("../deno.json"),
    outdir: resolve("./dist"),
    clearDistDir: true,
    treeShaking: true,
    sourceMap: true,
    serve: {
        watch: [resolve("../src"), resolve("./src")]
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

Deno.serve(async req => {
    const url = new URL(req.url);
    const filepath = decodeURIComponent(url.pathname);
    const file = await Deno.open(filepath, { read: true });
    return new Response(file.readable, {
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    });
}).unref();

await builder.serve();

function resolve(s: string) {
    const p = import.meta.resolve(s);
    return p.replace("file:///", "");
}