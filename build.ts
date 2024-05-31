import tailwindcss from "npm:tailwindcss";
import tailwindConfig from "./tailwind.config.js";
import * as path from "jsr:@std/path";
import * as esbuild from "npm:esbuild";
import dataUrlAsExternalPlugin from "jsr:@maemon4095-esbuild-x/plugin-data-url-as-external";
import importWebWorker from "jsr:@maemon4095-esbuild-x/plugin-import-web-worker@0.0.1";
import postcss from "jsr:@maemon4095-esbuild-x/plugin-postcss";
import generateIndexFile, { linking } from "jsr:@maemon4095-esbuild-x/plugin-generate-index-file@0.1.2";
import loaderOverride from "jsr:@maemon4095-esbuild-x/plugin-loader-override";
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
    bundle: true,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    jsxImportSource: "preact",
    write: false,
    outdir: distdir,
    sourcemap: mode !== "build",
    define: {
        "import.meta.isDev": JSON.stringify(mode !== "build")
    },
    plugins: [
        dataUrlAsExternalPlugin(),
        loaderOverride({ importMap: configPath, loader: { ".d.ts": "empty" } }),
        importWebWorker({ excludedPlugins: ["generated-files-replace-plugin", "emit-file"] }),
        postcss({
            plugins: [
                tailwindcss(tailwindConfig)
            ]
        }),
        generatedFilesPlugin(),
        generatedFilesReplacePlugin(),
        generateIndexFile({
            staticFiles: [
                { path: "./src/hotreload.ts", link: linking.script({}) }
            ]
        }),
        emitFilesPlugin(),
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

function generatedFilesPlugin(): esbuild.Plugin {
    return {
        name: "generated-files-plugin",
        setup(build) {
            build.initialOptions.metafile = true;
            build.initialOptions.write = false;
            const REPLACEMENT_STRING = `["GENERATED_FILES_REPLACEMENT"]`;

            build.onResolve({ filter: /^\$GENERATED_FILES$/ }, (args) => {
                return {
                    path: args.importer, namespace: "generated-files-plugin"
                };
            });

            build.onLoad({ filter: /.*/, namespace: "generated-files-plugin" }, () => {
                return { contents: `export default ${REPLACEMENT_STRING};` };
            });
        }
    };
}

function generatedFilesReplacePlugin(): esbuild.Plugin {
    return {
        name: "generated-files-replace-plugin",
        setup(build) {
            const REPLACEMENT_STRING = `["GENERATED_FILES_REPLACEMENT"]`;

            build.onEnd(args => {
                const outputs = args.metafile!.outputs;
                const localPaths = Object.keys(outputs).map(p => path.relative(build.initialOptions.outdir!, p));
                const replacement = JSON.stringify(localPaths);

                for (const file of args.outputFiles!) {
                    const replaced = file.text.replaceAll(REPLACEMENT_STRING, replacement);
                    if (file.text === replaced) {
                        continue;
                    }
                    file.contents = new TextEncoder().encode(replaced);
                }
            });
        }
    };
}

function emitFilesPlugin(): esbuild.Plugin {
    return {
        name: "emit-file",
        setup(build) {
            build.onEnd(async args => {
                const outputFiles = args.outputFiles!;
                for (const file of outputFiles) {
                    await Deno.mkdir(path.dirname(file.path), { recursive: true });
                    await Deno.writeFile(file.path, file.contents);
                }
            });
        }
    };
}