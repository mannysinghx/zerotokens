/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          blue:   '#00d4ff',
          purple: '#a855f7',
          green:  '#10b981',
          amber:  '#f59e0b',
          red:    '#ef4444',
          pink:   '#ec4899',
        },
        bg: {
          primary:   '#06061a',
          secondary: '#0d0d2b',
          card:      '#0f172a',
          elevated:  '#1e293b',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        display: ['"Exo 2"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        neon:       '0 0 20px rgba(0,212,255,0.4)',
        'neon-lg':  '0 0 40px rgba(0,212,255,0.5)',
        purple:     '0 0 20px rgba(168,85,247,0.4)',
        amber:      '0 0 20px rgba(245,158,11,0.5)',
        green:      '0 0 20px rgba(16,185,129,0.4)',
        red:        '0 0 20px rgba(239,68,68,0.4)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'scanline':   'scanline 8s linear infinite',
        'glitch':     'glitch 0.3s steps(2) infinite',
        'spin-slow':  'spin 8s linear infinite',
        'bounce-in':  'bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-up':   'slide-up 0.4s ease-out',
        'shake':      'shake 0.4s ease-in-out',
        'fade-in':    'fade-in 0.5s ease-out',
      },
      keyframes: {
        'pulse-neon': {
          '0%,100%': { textShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff' },
          '50%':      { textShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 60px #00d4ff' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        'scanline': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glitch': {
          '0%':  { transform: 'translate(0)' },
          '25%': { transform: 'translate(-2px, 1px)' },
          '75%': { transform: 'translate(2px, -1px)' },
        },
        'bounce-in': {
          '0%':   { transform: 'scale(0)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(30px)', opacity: 0 },
          '100%': { transform: 'translateY(0)',    opacity: 1 },
        },
        'shake': {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-8px)' },
          '40%':     { transform: 'translateX(8px)' },
          '60%':     { transform: 'translateX(-6px)' },
          '80%':     { transform: 'translateX(6px)' },
        },
        'fade-in': {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
