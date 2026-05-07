import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const sourceFiles = ["src/**/*.ts"];
const testFiles = ["tests/**/*.ts"];
const entrypointFiles = ["src/entrypoints/**/*.ts"];
const infrastructureFiles = ["src/infrastructure/**/*.ts"];
const loggerFiles = ["src/infrastructure/logger/**/*.ts"];

export default tseslint.config(
  {
    ignores: [
      ".wxt/**",
      ".output/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "pnpm-lock.yaml",
      "eslint.config.mjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettier,
  {
    files: [...sourceFiles, ...testFiles, "wxt.config.ts", "vitest.config.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "no-magic-numbers": "off",
      "@typescript-eslint/no-magic-numbers": [
        "warn",
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          enforceConst: true,
        },
      ],
      complexity: ["warn", { max: 8 }],
      "max-depth": ["error", 3],
      "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],
      "no-console": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/config/*", "../config/*", "../../config/*"],
              message: "Import public config from '@/config' only.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MetaProperty[meta.name='import'][property.name='meta'] MemberExpression[property.name='env']",
          message: "Read import.meta.env only in src/envs/variables.ts.",
        },
        {
          selector: "MemberExpression[object.name='chrome']",
          message: "Use chrome.* only in infrastructure adapters and entrypoint wiring.",
        },
      ],
    },
  },
  {
    files: ["src/envs/variables.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='chrome']",
          message: "Use chrome.* only in infrastructure adapters and entrypoint wiring.",
        },
      ],
    },
  },
  {
    files: [...infrastructureFiles, ...entrypointFiles],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MetaProperty[meta.name='import'][property.name='meta'] MemberExpression[property.name='env']",
          message: "Read import.meta.env only in src/envs/variables.ts.",
        },
      ],
    },
  },
  {
    files: loggerFiles,
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/app/**",
            "@/infrastructure/**",
            "@/composition/**",
            "@/entrypoints/**",
            "@/config/**",
            "@/envs/**",
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/infrastructure/**", "@/composition/**", "@/entrypoints/**"],
        },
      ],
    },
  },
  {
    files: testFiles,
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
      "max-lines-per-function": "off",
    },
  },
);
