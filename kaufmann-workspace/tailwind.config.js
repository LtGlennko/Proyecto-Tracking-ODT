/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/*.{html,ts}',
    './libs/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:  '#1E3A5F',
          blue:  '#2E75B6',
          light: '#EFF6FF',
        },
        status: {
          ontime:  '#10b981',
          delayed: '#ef4444',
          done:    '#6b7280',
          pending: '#94a3b8',
          active:  '#3b82f6',
          warning: '#f59e0b',
        },
        line: {
          vc:   '#3b82f6',
          autos: '#8b5cf6',
          maq:  '#f97316',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
