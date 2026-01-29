import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const eslintConfig = [
  {
    ignores: [
        "node_modules/**",
        ".next/**",
        "out/**",
        "build/**",
        ".vercel/**",
        "next-env.d.ts",
        "scripts/**",
        "tmp/**",
        "tmp-*.js",
        "dist/**",
        "coverage/**",
        ".husky/**",
        ".git/**"
    ]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      "no-console": "warn"
    }
  }
];

export default eslintConfig;
