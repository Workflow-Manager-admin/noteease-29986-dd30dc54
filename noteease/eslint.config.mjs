import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      "build/",
      "dist/",
      "*.log",
      "*.tmp",
      "*.tsbuildinfo",
      "coverage/",
      ".vscode/",
      ".idea/",
      "*.config.mjs", // Ignoring itself from linting
    ],
  },
  {
    // This configuration is for TypeScript files. 
    // While the current project is JS, it's good to keep if TS might be added later.
    // If not, this whole block could be removed or commented out.
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Your custom rules here
    },
  },
  {
    // Configuration for JavaScript files (including .js and .mjs)
    files: ["**/*.js", "**/*.mjs"], // Apply to .js and .mjs files
    languageOptions: {
      globals: {
        document: "readonly",
        localStorage: "readonly",
        console: "readonly",
        alert: "readonly",
        confirm: "readonly",
        window: "readonly",
        Date: "readonly", // Added for Date object usage (e.g. in utils.js)
        Math: "readonly", // Added for Math object usage (e.g. in utils.js)
        Set: "readonly", // Added for Set object usage (e.g. in store.js)
      },
      ecmaVersion: "latest", // Specify ECMAScript version
      sourceType: "module", // Since we are using ES6 modules
    },
    rules: {
        "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn about unused vars, allow underscore prefix for unused args
        "no-undef": "error", // Keep this as error
        // Add any other JS specific rules here
    }
  },
];
