/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        bahnschrift: ["Bahnschrift", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", "Arial", "sans-serif"],
      },
    }
  },
  plugins: []
}
