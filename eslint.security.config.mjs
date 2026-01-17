import securityPlugin from "eslint-plugin-security";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        React: "readonly",
        JSX: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "security": securityPlugin
    },
    rules: {
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off", // Too noisy for build scripts
      "no-restricted-syntax": [
        "error",
        {
          "selector": "CallExpression[callee.property.name='exec']",
          "message": "Exec is dangerous. Use child_process.execFile or spawn instead."
        },
        {
          "selector": "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          "message": "Dangerous HTML detected. Use DOMPurify or safe alternatives."
        }
      ]
    }
  },
  {
    ignores: [
        "**/node_modules/**", 
        ".next/**", 
        "dist/**", 
        ".vercel/**", 
        "**/*.d.ts"
    ]
  }
];
