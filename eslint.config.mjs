import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  js.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        __dirname: "readonly",
        Thenable: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",

      eqeqeq: ["error", "always"],
      curly: "error",
      semi: ["error", "always"],
      quotes: "off",
      indent: ["error", 2],
      "comma-dangle": ["error", "always-multiline"],
      "no-console": "off",
    },
  },

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      eqeqeq: ["error", "always"],
      curly: "error",
      semi: ["error", "always"],
      quotes: "off",
      "no-console": "off",
    },
  },

  {
    files: ["tests/**/*.ts", "tests/**/*.js"],
    languageOptions: {
      globals: {
        suite: "readonly",
        test: "readonly",
      },
    },
  },

  {
    ignores: ["node_modules/**", "dist/**"],
  },
]);
