/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 🔥 BURASI ÇOK ÖNEMLİ - 'class' olarak ayarla
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
        // Tema renkleri için CSS değişkenleri
        theme: {
          bg: 'var(--bg-primary)',
          'bg-secondary': 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          text: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          border: 'var(--border-primary)',
        }
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