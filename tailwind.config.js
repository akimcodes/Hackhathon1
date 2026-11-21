/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf7',
          100: '#d1fae7',
          200: '#a7f3d3',
          300: '#6ee7ba',
          400: '#34d39e',
          500: '#138A72', // Primary theme color
          600: '#0e705d',
          700: '#0c584a',
          800: '#0b473d',
          900: '#093b33',
        },
        background: '#F7FAF9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      }
    },
  },
  plugins: [],
}
