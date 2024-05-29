import { Builder, BuilderOptions } from "file:///C:/Users/maemon/repos/deno-esbuilder/src/mod.ts";
import tailwindcss from "npm:tailwindcss";
import postCssPlugin from "file:///C:/Users/maemon/repos/deno-esbuilder/plugins/postCssPlugin.ts";
import tailwindConfig from "./tailwind.config.js";
import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.21.2/mod.js";

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
        watch: ["./src", "./src-worker"]
    },
    esbuildPlugins: [
        dataUrlAsExternalPlugin(),
        workerPlugin({ excludedPlugins: ["generated-files-replace-plugin"] }),
        postCssPlugin({
            plugins: [
                tailwindcss(tailwindConfig)
            ]
        }),
        generatedFilesPlugin(),
        generatedFilesReplacePlugin(),
        emitFilesPlugin()
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

function dataUrlAsExternalPlugin(): esbuild.Plugin {
    return {
        name: "data-url-as-external",
        setup(build) {
            build.onResolve({ filter: /^data.*$/ }, args => {
                return { path: args.path, external: true };
            });
        }
    };
}

function workerPlugin(options?: { excludedPlugins: string[]; }): esbuild.Plugin {
    return {
        name: "worker",
        setup(build) {

            const pluginFilter = (() => {
                const excluded = options?.excludedPlugins ?? [];
                return (p: esbuild.Plugin) => {
                    if (p.name === "worker") {
                        return false;
                    }
                    return !excluded.includes(p.name);
                };
            })();

            build.onResolve({ filter: /^.*\.worker\.ts$/ }, args => {
                return {
                    namespace: "worker", path: args.path.substring(0, args.path.length - 9) + "js",
                    pluginData: path.isAbsolute(args.path) ? args.path : path.join(args.resolveDir, args.path)
                };
            });

            build.onLoad({ filter: /.*/, namespace: "worker" }, async args => {
                const plugins = build.initialOptions.plugins?.filter(p => pluginFilter(p));
                const result = await esbuild.build({
                    ...build.initialOptions,
                    plugins,
                    write: false,
                    sourcemap: false,
                    sourcesContent: false,
                    entryPoints: [path.relative(".", args.pluginData)]
                });

                return { contents: result.outputFiles[0].contents, loader: "file" };
            });
        }
    };
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
};

function generatedFilesReplacePlugin(): esbuild.Plugin {
    return {
        name: "generated-files-replace-plugin",
        setup(build) {
            const REPLACEMENT_STRING = `["GENERATED_FILES_REPLACEMENT"]`;

            build.onEnd(args => {
                const outputs = args.metafile!.outputs;
                const localPaths = Object.keys(outputs).map(p => path.relative(build.initialOptions.outdir!, p));
                const replacement = JSON.stringify(localPaths);
                console.log("replace", replacement);
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
};


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