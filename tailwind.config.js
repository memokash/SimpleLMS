/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '2xs': '360px',
      },
      colors: {
        // Edumat color palette
        primary: {
          DEFAULT: '#07294D', // Theme color
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#07294D', // Main theme color
          800: '#052039',
          900: '#031525',
        },
        secondary: {
          DEFAULT: '#0C8B51', // Theme color 2
          50: '#e6f7ed',
          100: '#c1e9d1',
          200: '#98dab2',
          300: '#6fcb93',
          400: '#46bc74',
          500: '#0C8B51', // Main secondary color
          600: '#0a7243',
          700: '#085935',
          800: '#064028',
          900: '#03271a',
        },
        gray: {
          DEFAULT: '#F1F1F1', // Edumat gray
          50: '#fafafa',
          100: '#F1F1F1', // Main gray
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        body: {
          DEFAULT: '#151515', // Body color
          light: '#222222', // Black variant
          dark: '#0a0a0a',
        },
        border: {
          DEFAULT: '#DBDBDB', // Border color
        }
      },
      fontFamily: {
        sans: ['Exo', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}