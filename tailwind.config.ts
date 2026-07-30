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
          navy: '#1A2F3D',
          teal: '#2A4A5A',
          'teal-light': '#3D6B7A',
          gold: '#D4A84B',
          'gold-light': '#E8C87A',
          cream: '#F5F2E8',
          white: '#FFFFFF',
          muted: '#8A9BA5',
          'muted-dark': '#5A6B75',
          accent: '#4A8A9A',
          warning: '#D4784B',
        },
        council: {
          wood: '#1A2F3D',
          gold: '#D4A84B',
          charcoal: '#F5F2E8',
          warmstone: '#2A4A5A',
          softash: '#5A6B75',
          idle: '#8A9BA5',
          thinking: '#4A8A9A',
          tension: '#D4784B',
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

