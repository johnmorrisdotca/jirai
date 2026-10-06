import js from "@eslint/js";
import ts from "typescript-eslint";
export default ts.config(
  { ignores: ["dist/**", "site/**", "node_modules/**", "test-results/**", "playwright-report/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  { files: ["demo/**/*.js"], languageOptions: { globals: { familyLanguage: "readonly", document: "readonly", URLSearchParams: "readonly", location: "readonly", localStorage: "readonly", crypto: "readonly", URL: "readonly", navigator: "readonly" } } },
  { files: ["**/*.mjs"], languageOptions: { globals: { process: "readonly", console: "readonly", URL: "readonly" } } },
  { files: ["scripts/readme-pictures.mjs"], languageOptions: { globals: { window: "readonly" } } },
  { files: ["e2e/reference.spec.js"], languageOptions: { globals: { process: "readonly", URL: "readonly", document: "readonly", window: "readonly" } } },
  { rules: { "@typescript-eslint/no-non-null-assertion": "off" } }
);
