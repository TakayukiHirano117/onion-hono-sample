import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const restrictedLayerImports = (patterns) => ({
  "no-restricted-imports": [
    "error",
    {
      patterns: patterns.map(({ group, message }) => ({
        group,
        message,
      })),
    },
  ],
});

export default tseslint.config(
  {
    ignores: ["node_modules/", "coverage/", "dist/", "bun.lock"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        Bun: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/domain/**/*.ts"],
    rules: restrictedLayerImports([
      {
        group: ["**/application_service/**", "**/infra/**", "**/presentation/**", "**/cmd/**"],
        message:
          "Domain 層は他の層に依存しないでください。Domain 内の型や interface に閉じて表現してください。",
      },
    ]),
  },
  {
    files: ["src/application_service/**/*.ts"],
    rules: restrictedLayerImports([
      {
        group: ["**/presentation/**", "**/cmd/**"],
        message:
          "ApplicationService 層は Presentation / Cmd 層に依存しないでください。ユースケースは Domain と Infra の抽象に依存してください。",
      },
    ]),
  },
  {
    files: ["src/infra/**/*.ts"],
    rules: restrictedLayerImports([
      {
        group: ["**/presentation/**", "**/cmd/**"],
        message:
          "Infra 層は Presentation / Cmd 層に依存しないでください。技術詳細の実装に閉じてください。",
      },
    ]),
  },
  {
    files: ["src/presentation/**/*.ts"],
    rules: restrictedLayerImports([
      {
        group: ["**/domain/**", "**/infra/**"],
        message:
          "Presentation 層は Domain / Infra 層に直接依存しないでください。ApplicationService 経由で接続してください。",
      },
      {
        group: [
          "**/cmd/bun.ts",
          "**/cmd/worker.ts",
          "**/cmd/index.ts",
          "**/cmd/config/**",
        ],
        message:
          "Presentation 層は Cmd 層に直接依存しないでください。middleware の型参照のみ例外（`**/cmd/middlewares/**`）。",
      },
    ]),
  },
  eslintConfigPrettier,
);
