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
        council: {
          wood: '#5A4636',
          gold: '#D6B25E',
          charcoal: '#1F1F1F',
          warmstone: '#E8E4DD',
          softash: '#B7B2A8',
          idle: '#8E8577',
          thinking: '#6C7A89',
          tension: '#C17C5A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Libre Baskerville', 'serif'],
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

