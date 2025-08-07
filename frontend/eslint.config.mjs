import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error", // or 'warn'
        {
          vars: "all", // check all variables
          args: "after-used", // only unused function args after the last used one
          ignoreRestSiblings: true, // ignore ...rest destructured siblings
          varsIgnorePattern: "^_", // ignore any variable starting with _
          argsIgnorePattern: "^_", // ignore any argument      starting with _
          caughtErrorsIgnorePattern: "^_", // ignore catch(e)         starting with _
        },
      ],
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
