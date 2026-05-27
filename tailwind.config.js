/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          background: '#090909',
          surface: '#121212',
          faded: '#1b1b1b',
        },
      },
      boxShadow: {
        netflix: '0 24px 80px rgba(0,0,0,0.65)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, rgba(9, 9, 9, 0.1) 0%, rgba(9, 9, 9, 0.95) 55%)',
      },
    },
  },
  plugins: [],
}

