import { globalIgnores } from "eslint/config";

export default [
  globalIgnores([
    "dist/**",
    ".astro/**",
    "node_modules/**",
    "package-lock.json",
  ]),
];
