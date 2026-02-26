import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  {
    ignores: ["dist/**", "*.js"],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    files: ["src/**/*.ts"],
    rules: {
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/indent": ["error", 2],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
    },
  },
);
