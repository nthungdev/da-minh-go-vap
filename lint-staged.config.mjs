const lintStagedConfig = {
  "*.{js,mjs,cjs,ts,jsx,tsx,css,json}":
    "biome check --write --no-errors-on-unmatched",
  "*.{md,mdx,yaml,yml}": "prettier --write",
  "*.{ts,tsx}": () => "tsc --noEmit",
};

export default lintStagedConfig;
