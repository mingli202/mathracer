import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
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
    },
  },
);
