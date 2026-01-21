import securityPlugin from "eslint-plugin-security";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import sonarjs from "eslint-plugin-sonarjs";

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
      "security": securityPlugin,
      "sonarjs": sonarjs
    },
    rules: {
      ...sonarjs.configs.recommended.rules,
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "warn", 
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "no-restricted-syntax": [
        "error",
        {
          "selector": "CallExpression[callee.property.name='exec']",
          "message": "Exec is dangerous. Use child_process.execFile or spawn instead."
        },
        {
          "selector": "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          "message": "Dangerous HTML detected. Use DOMPurify or safe alternatives."
        },
        {
          "selector": "CallExpression[callee.name='eval']",
          "message": "eval() is a high-risk security hazard."
        }
      ],
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-duplicate-string": "warn"
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
