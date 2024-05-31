import tailwindcss from "npm:tailwindcss";
import tailwindConfig from "./tailwind.config.js";
import * as path from "jsr:@std/path";
import * as esbuild from "npm:esbuild";
import dataUrlAsExternalPlugin from "jsr:@maemon4095-esbuild-x/plugin-data-url-as-external";
import importWebWorker from "jsr:@maemon4095-esbuild-x/plugin-import-web-worker@0.1.0";
import postcss from "jsr:@maemon4095-esbuild-x/plugin-postcss";
import generateIndexFile, { linking } from "jsr:@maemon4095-esbuild-x/plugin-generate-index-file@0.1.2";
import loaderOverride from "jsr:@maemon4095-esbuild-x/plugin-loader-override@0.1.0";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

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
const distdir = path.join(import.meta.dirname!, "./dist");
const configPath = path.join(import.meta.dirname!, "./deno.json");
const context = await esbuild.context({
    entryPoints: ["./src/index.tsx", "./src/index.css"],
    metafile: true,
    bundle: true,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    jsxImportSource: "preact",
    assetNames: "[name]",
    outdir: distdir,
    sourcemap: mode !== "build",
    loader: { ".d.ts": "empty" },
    define: {
        "import.meta.isDev": JSON.stringify(mode !== "build")
    },
    plugins: [
        cleanOutdir(),
        dataUrlAsExternalPlugin(),
        loaderOverride({ importMap: configPath }),
        importWebWorker({ excludedPlugins: ["generated-files-replace-plugin", "emit-file", "clean-outdir"] }),
        postcss({
            plugins: [
                tailwindcss(tailwindConfig)
            ]
        }),
        generateIndexFile({
            staticFiles: [
                { path: "./public/icon.svg", link: linking.link({ rel: "shortcut icon" }) },
                { path: "./public/manifest.webmanifest", link: linking.link({ rel: "manifest" }) },
                ...(mode === "build" ? [] : [{ path: "./public/hotreload.js", link: linking.script({}) }])
            ],
        }),
        ...denoPlugins({ configPath: configPath }),
    ]
});

switch (mode) {
    case "serve": {
        await context.watch();
        const { host, port } = await context.serve({ servedir: distdir });
        const hostname = host === "0.0.0.0" ? "localhost" : host;
        console.log(`Serving: http://${hostname}:${port}`);
        break;
    }
    case "build": {
        await context.rebuild();
        await context.dispose();
        break;
    }
}



function cleanOutdir(): esbuild.Plugin {
    return {
        name: "clean-outdir",
        setup(build) {
            const { outdir } = build.initialOptions;
            if (outdir === undefined) {
                throw new Error("outdir must be set.");
            }
            build.onStart(async () => {
                try {
                    await Deno.remove(outdir, { recursive: true });
                } catch {
                    console.log("Failed to clear outdir.");
                }
            });
        }
    };
}