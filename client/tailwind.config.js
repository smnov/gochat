/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      'dark-primary': '#131a1c',
      'dark-secondary': '#1b2224',
      red: '#e74c4c',
      green: '#6bb05d',
      blue: '#0183ff',
      grey: '#dddfe2',
      darkgrey: '#808080',
      white: '#fff',
      orange: '#FFA500',
      purple: '#A020F0',
      blush: '#BC544B',
      lightgrey: '#D9DDDC'
    },
    extend: {},
  },
  plugins: [],
}

