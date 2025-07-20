const lintStagedConfig = {
  "*.{js,ts,jsx,tsx,json}": "eslint --cache --fix",
  "*.{js,ts,jsx,tsx,css,md,json,yaml,yml}": "prettier --write",
};

export default lintStagedConfig;
