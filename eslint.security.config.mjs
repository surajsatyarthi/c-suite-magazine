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
      "security/detect-unsafe-regex": "warn",
      "security/detect-buffer-noassert": "warn",
      "no-restricted-syntax": [
        "warn",
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
      "sonarjs/cognitive-complexity": ["warn", 15],
      "sonarjs/no-duplicate-string": "warn",
      "sonarjs/no-nested-functions": "warn",
      "sonarjs/no-ignored-exceptions": "warn",
      "sonarjs/unused-import": "warn",
      "sonarjs/slow-regex": "warn",
      "sonarjs/no-nested-template-literals": "warn",
      "sonarjs/no-nested-conditional": "warn",
      "sonarjs/regex-complexity": "warn",
      "sonarjs/no-dead-store": "warn",
      "sonarjs/no-unused-vars": "warn",
      "sonarjs/no-redundant-assignments": "warn",
      "sonarjs/no-commented-code": "warn",
      "sonarjs/concise-regex": "warn",
      "sonarjs/updated-loop-counter": "warn",
      "sonarjs/no-redundant-jump": "warn",
      "sonarjs/pseudo-random": "warn",
      "sonarjs/no-useless-catch": "warn",
      "sonarjs/todo-tag": "warn",
      "sonarjs/no-unused-collection": "warn",
      "sonarjs/anchor-precedence": "warn",
      "sonarjs/assertions-in-tests": "warn",
      "sonarjs/empty-string-repetition": "warn",
      "sonarjs/no-clear-text-protocols": "warn",
      "sonarjs/no-os-command-from-path": "warn",
      "sonarjs/single-char-in-character-classes": "warn"
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
