/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        card: '#ffffff',
        input: '#f1f5f9',
        primary: {
          DEFAULT: '#e85d4a', // Warm coral
          hover: '#d94d3a',
        },
        accent: {
          amber: '#d97706',
          emerald: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
