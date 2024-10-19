import type { Config } from 'tailwindcss'
import defaultColors from 'tailwindcss/colors'

const colorPalette = {
  chill: {
    '50': '#eafffd',
    '100': '#cafffb',
    '200': '#9cfffa',
    '300': '#57fff9',
    '400': '#0cfcff',
    '500': '#00deea',
    '600': '#00b0c4',
    '700': '#008596',
    DEFAULT: '#008596',
    '800': '#0b6f7f',
    '900': '#0e5b6b',
    '950': '#023d4a',
  },
  matisse: {
    '50': '#f3f7fc',
    '100': '#e7eff7',
    '200': '#c9dcee',
    '300': '#9abfdf',
    '400': '#639dcd',
    '500': '#3f81b8',
    '600': '#2f689d',
    DEFAULT: '#2f689d',
    '700': '#27537d',
    '800': '#234669',
    '900': '#223c58',
    '950': '#17273a',
  },
  'dodger-blue': {
    '50': '#effaff',
    '100': '#daf3ff',
    '200': '#bdecff',
    '300': '#90e1ff',
    '400': '#5ccffe',
    '500': '#36b3fb',
    '600': '#279af1',
    DEFAULT: '#279af1',
    '700': '#187edd',
    '800': '#1a65b3',
    '900': '#1b568d',
    '950': '#153556',
  },
  'gun-powder': {
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
    DEFAULT: '#444054',
    '950': '#322f3c',
  },
  'light-apricot': {
    '50': '#fff6ed',
    '100': '#ffebd5',
    '200': '#fed9b7',
    DEFAULT: '#fed9b7',
    '300': '#fdb274',
    '400': '#fb873c',
    '500': '#f96616',
    '600': '#ea4b0c',
    '700': '#c2370c',
    '800': '#9a2c12',
    '900': '#7c2712',
    '950': '#431107',
  },
  keppel: {
    '50': '#f3faf7',
    '100': '#d7f0e8',
    '200': '#aee1d2',
    '300': '#7ecab6',
    '400': '#58b09c',
    DEFAULT: '#58b09c',
    '500': '#3a9280',
    '600': '#2c7568',
    '700': '#275e54',
    '800': '#234c46',
    '900': '#21403b',
    '950': '#0e2523',
  },
  viola: {
    '50': '#f9f6f8',
    '100': '#f5eef3',
    '200': '#ebdfe7',
    '300': '#dcc5d4',
    '400': '#c6a0b7',
    '500': '#b98ea7',
    DEFAULT: '#b98ea7',
    '600': '#9b6783',
    '700': '#83536b',
    '800': '#6d4759',
    '900': '#5d3e4d',
    '950': '#36212b',
  },
}

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    'node_modules/preline/dist/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        ...colorPalette,
        primary: {
          ...colorPalette.chill,
        },
        secondary: {
          ...defaultColors.orange,
          DEFAULT: defaultColors.orange[600],
        },
      },
      ringColor: {
        ...defaultColors.orange,
        DEFAULT: defaultColors.orange[300],
      },
      boxShadow: {
        'neon': '0 0 10px 3px rgba(231,131,103,0.8), 0 0 10px 3px rgba(230,75,32,0.9)',
      },
      fontFamily: {
        header: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('preline/plugin'),
    require('@tailwindcss/container-queries'),
  ],
}
export default config
