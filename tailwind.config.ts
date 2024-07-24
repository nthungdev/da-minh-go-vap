import type { Config } from "tailwindcss";

const colorPalette = {
  'dodger-blue': {
    DEFAULT: '#279af1',
    '50': '#effaff',
    '100': '#daf3ff',
    '200': '#bdecff',
    '300': '#90e1ff',
    '400': '#5ccffe',
    '500': '#36b3fb',
    '600': '#279af1',
    '700': '#187edd',
    '800': '#1a65b3',
    '900': '#1b568d',
    '950': '#153556',
  },
  'gun-powder': {
    DEFAULT: '#444054',
    '50': '#f5f5f9',
    '100': '#e9e9f0',
    '200': '#d8d8e5',
    '300': '#bdbdd3',
    '400': '#9e9dbd',
    '500': '#8885ac',
    '600': '#79739d',
    '700': '#6f678e',
    '800': '#5e5776',
    '900': '#444054',
    '950': '#322f3c',
  },
  'light-apricot': {
    DEFAULT: '#fed9b7',
    '50': '#fff6ed',
    '100': '#ffebd5',
    '200': '#fed9b7',
    '300': '#fdb274',
    '400': '#fb873c',
    '500': '#f96616',
    '600': '#ea4b0c',
    '700': '#c2370c',
    '800': '#9a2c12',
    '900': '#7c2712',
    '950': '#431107',
  },
  'keppel': {
    DEFAULT: '#58b09c',
    '50': '#f3faf7',
    '100': '#d7f0e8',
    '200': '#aee1d2',
    '300': '#7ecab6',
    '400': '#58b09c',
    '500': '#3a9280',
    '600': '#2c7568',
    '700': '#275e54',
    '800': '#234c46',
    '900': '#21403b',
    '950': '#0e2523',
  },
  'viola': {
    DEFAULT: '#b98ea7',
    '50': '#f9f6f8',
    '100': '#f5eef3',
    '200': '#ebdfe7',
    '300': '#dcc5d4',
    '400': '#c6a0b7',
    '500': '#b98ea7',
    '600': '#9b6783',
    '700': '#83536b',
    '800': '#6d4759',
    '900': '#5d3e4d',
    '950': '#36212b',
  },
}

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        ...colorPalette,
        primary: colorPalette['dodger-blue'],
        secondary: colorPalette['keppel'],
      }
    },
  },
  plugins: [],
};
export default config;
