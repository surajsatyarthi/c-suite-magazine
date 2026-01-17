const eslintConfig = [
  {
    ignores: [
        ".next/**",
        "out/**",
        "build/**",
        ".vercel/**",
        "next-env.d.ts",
        "scripts/**",
        "tmp/**",
        "tmp-*.js"
    ]
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    rules: {
      "no-console": "warn"
    }
  }
];

export default eslintConfig;
