import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...compat.config(
    {
      extends: ["next/core-web-vitals", "next/typescript"],
      rules: {
        //   "@typescript-eslint/ban-ts-comment": "warn",
        //   "@typescript-eslint/no-empty-object-type": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        //   "@typescript-eslint/no-unused-vars": [
        //     "warn",
        //     {
        //       vars: "all",
        //       args: "after-used",
        //       ignoreRestSiblings: false,
        //       argsIgnorePattern: "^_",
        //       varsIgnorePattern: "^_",
        //       destructuredArrayIgnorePattern: "^_",
        //       caughtErrorsIgnorePattern: "^(_|ignore)",
        //     },
        //   ],
      },
    },
    {
      ignores: [".next", ".pnpm-store", "node_modules"],
    },
  ),
];

export default eslintConfig;
