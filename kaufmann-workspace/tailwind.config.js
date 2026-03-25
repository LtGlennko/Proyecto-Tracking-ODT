/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/*.{html,ts}',
    './libs/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand ──
        brand: {
          navy:  '#1E3A5F',
          blue:  '#2E75B6',
          light: '#EFF6FF',
        },

        // ── VIN Status (estado general) ──
        'st-ontime':   { DEFAULT: '#10b981', light: '#ecfdf5', border: '#a7f3d0' },  // emerald
        'st-risk':     { DEFAULT: '#f59e0b', light: '#fffbeb', border: '#fde68a' },  // amber
        'st-delayed':  { DEFAULT: '#ef4444', light: '#fef2f2', border: '#fecaca' },  // red
        'st-done':     { DEFAULT: '#64748b', light: '#f8fafc', border: '#e2e8f0' },  // slate
        'st-active':   { DEFAULT: '#3b82f6', light: '#eff6ff', border: '#bfdbfe' },  // blue
        'st-pending':  { DEFAULT: '#94a3b8', light: '#f1f5f9', border: '#e2e8f0' },  // slate light

        // ── Líneas de negocio: colores desde BD (tipo_vehiculo.color) ──
        // No hardcodear aquí — se aplican dinámicamente via [style.color]

        // ── Flujo (flechas, separadores) ──
        flow: {
          arrow: '#93c5fd',  // blue-300
          sep:   '#cbd5e1',  // slate-300
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
