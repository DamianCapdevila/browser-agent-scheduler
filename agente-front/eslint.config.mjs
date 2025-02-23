import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginNext from "eslint-plugin-next";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Recommended configurations
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginNext.configs.recommended,
  // Custom overrides placed last
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Disabling rules that cause issues
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Disable prop-types check since you're using TypeScript
    },
  },
];
