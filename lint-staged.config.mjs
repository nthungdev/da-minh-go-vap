const lintStagedConfig = {
  "*.{js,ts,jsx,tsx,css,json}": [
    "prettier --write",
    "biome check --write --no-errors-on-unmatched",
  ],
  "*.{md,yaml,yml}": "prettier --write",
  "*.{ts,tsx}": () => "tsc --noEmit",
};

export default lintStagedConfig;
