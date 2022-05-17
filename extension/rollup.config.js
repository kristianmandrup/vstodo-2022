// import svelte from "rollup-plugin-svelte";
// import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import preprocess from "svelte-preprocess";
import css from 'rollup-plugin-css-only';
import typescript from "@rollup/plugin-typescript";
import path from "path";
import fs from "fs";

const production = !process.env.ROLLUP_WATCH;

export default fs
  .readdirSync(path.join(__dirname, "webviews", "pages"))
  .map((input) => {
    const name = input.split(".")[0];
    const output = `${name}.css`;
    return {
      input: "webviews/pages/" + input,
      output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "out/compiled/" + name + ".js",
      },
      plugins: [
        // typescript({
        //   tsconfig: "webviews/tsconfig.json",
        //   sourceMap: !production,
        //   inlineSources: !production,
        // }),          
        commonjs(),
          // resolve({
          //   browser: true,
          //   dedupe: ["svelte"],
          // }),          
        css({output}),
        preprocess(),
      // If we're building for production (npm run build
      // instead of npm run dev), minify
        production && terser()          
      ],
      // In dev mode, call `npm run start` once
      // the bundle has been generated
      // !production && serve(),
      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      // !production && livereload("public"),
      watch: {
        clearScreen: false,
      },
    };
  });
