import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],

    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      "**/static/**",
      "**/*.min.js",       // file hasil minify
      "**/*.bundle.js"     // file hasil bundle (misal dari webpack/vite)
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },

    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn"
    }
  }
];
