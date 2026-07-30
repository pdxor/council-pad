import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        futurist: {
          white: '#FFFFFF',
          light: '#F8F9FA',
          'light-gray': '#E9ECEF',
          border: '#DEE2E6',
          'muted-text': '#6C757D',
          'dark-text': '#212529',
          navy: '#1A3A4A',
          teal: '#2D5A6A',
          'teal-light': '#4A8A9A',
          gold: '#D4A84B',
          'gold-light': '#E8C87A',
          accent: '#3D8B8B',
          warning: '#D4784B',
        },
        council: {
          wood: '#FFFFFF',
          gold: '#D4A84B',
          charcoal: '#212529',
          warmstone: '#F8F9FA',
          softash: '#DEE2E6',
          idle: '#6C757D',
          thinking: '#3D8B8B',
          tension: '#D4784B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-libre-baskerville)', 'serif'],
      },
      borderRadius: {
        'council': '10px',
      },
      transitionDuration: {
        'council': '400ms',
      },
      transitionTimingFunction: {
        'council': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
export default config

