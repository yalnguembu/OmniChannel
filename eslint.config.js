import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import * as tseslint from "typescript-eslint"
import * as prettierConfig from "eslint-config-prettier"
import eslintPluginPrettier from "eslint-plugin-prettier"

export default tseslint.config({ ignores: ["dist"] }, ...tseslint.configs.recommended, prettierConfig.default, {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
    parser: tseslint.parser,
  },
  plugins: {
    "@typescript-eslint": tseslint.plugin,
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
    prettier: eslintPluginPrettier,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "react-hooks/rules-of-hooks": "warn",
    "prettier/prettier": "error",
    "no-unused-vars": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "warn", // Points d'arrêt debugger
    "prefer-const": "warn", // Préférer const à let quand possible
    "no-shadow": [
      "warn",
      {
        builtinGlobals: false,
        hoist: "functions",
        allow: [],
        ignoreOnInitialization: true,
        ignoreTypeValueShadow: true,
        ignoreFunctionTypeParameterNameValueShadow: true,
      },
    ],
    "no-multiple-empty-lines": ["warn", { max: 1 }], // Max 1 ligne vide consécutive
    "@typescript-eslint/no-explicit-any": "warn", // Usage de type 'any'
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        varsIgnorePattern: "^_", // ignore _ prefixed vars
        argsIgnorePattern: "^_", // ignore _ prefixed args
      },
    ],
    "@typescript-eslint/no-empty-object-type": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn", // Usage de l'opérateur !
  },
})
