/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f1fbf7',
          100: '#d8f6e8',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },
      },
    },
  },
  plugins: [],
};
