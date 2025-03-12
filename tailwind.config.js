/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3faf7',
          100: '#d8efe7',
          200: '#b1ded0',
          300: '#82c6b3',
          400: '#57aa94',
          500: '#3d8d7a',
          600: '#2f7263',
          700: '#295c51',
          800: '#254a43',
          900: '#223f39',
          950: '#0f2421',
        },
        secondary: {
          50: '#fcf5f4',
          100: '#faeae9',
          200: '#f5d6d6',
          300: '#ecb5b5',
          400: '#e18b8b',
          500: '#d26165',
          600: '#bc424c',
          700: '#9e323e',
          800: '#852c39',
          900: '#722935',
          950: '#3f1219',
        },
        tertiary: {
          50: '#f2f7fc',
          100: '#e2edf7',
          200: '#cbe0f2',
          300: '#a7cde9',
          400: '#7db3dd',
          500: '#5d97d3',
          600: '#4a7fc6',
          700: '#406cb5',
          800: '#395894',
          900: '#324c76',
          950: '#222f49',
        },
      },
    },
  },
  plugins: [],
};
