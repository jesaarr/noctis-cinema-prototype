/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 🔥 BURASI ÇOK ÖNEMLİ - 'class' olarak ayarla
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        noctis: {
          bg: '#07070c',
          card: '#111115',
          panel: '#0c0c11',
          slate: '#17171d',
          gold: '#d4af37',
          platinum: '#f4f4f5',
          muted: '#9ca3af',
          'muted-light': '#c8c9cc',
        },
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
      letterSpacing: {
        luxury: '0.28em',
      },
      boxShadow: {
        netflix: '0 24px 80px rgba(0,0,0,0.65)',
        noctis: '0 30px 90px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, rgba(9, 9, 9, 0.1) 0%, rgba(9, 9, 9, 0.95) 55%)',
        'noctis-fade': 'radial-gradient(circle at top, rgba(212,175,55,0.08), transparent 42%)',
      },
    },
  },
  plugins: [],
}