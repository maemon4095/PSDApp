import { Builder, BuilderOptions } from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.2.3/src/mod.ts";

import tailwindcss from "npm:tailwindcss";
import postCssPlugin from "https://raw.githubusercontent.com/maemon4095/deno-esbuilder/release/v0.2.3/plugins/postCssPlugin.ts";
import tailwindConfig from "./tailwind.config.js";
const mode = Deno.args.at(0);
if (mode === undefined) {
    throw new Error("no mode was provided");
}

const options: BuilderOptions = {
    documentFilePath: "./src-ui/index.html",
    denoConfigPath: "./deno.json",
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
    case "serve": {
        await builder.serve();
        break;
    }
    case "build": {
        await builder.build();
        break;
    }
}