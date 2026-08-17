/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinic: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7d0c8',
          500: '#647a66',
          700: '#435445',
          900: '#232c24',
        }
      },
      fontFamily: {
        sans: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      boxShadow: {
        'clinic': '0 4px 20px -2px rgba(22, 163, 74, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'clinic-lg': '0 10px 30px -3px rgba(22, 163, 74, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
