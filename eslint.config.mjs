import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  js.configs.recommended,

  ...tsPlugin.configs["flat/recommended"],

  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
      },
    },
    rules: {
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
