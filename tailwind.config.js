/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        'tone-red': 'rgb(var(--tone-red) / <alpha-value>)',
        'tone-red-line': 'rgb(var(--tone-red-line) / <alpha-value>)',
        'tone-amber': 'rgb(var(--tone-amber) / <alpha-value>)',
        'tone-amber-line': 'rgb(var(--tone-amber-line) / <alpha-value>)',
        'tone-green': 'rgb(var(--tone-green) / <alpha-value>)',
        'tone-green-line': 'rgb(var(--tone-green-line) / <alpha-value>)',
        'tone-cyan': 'rgb(var(--tone-cyan) / <alpha-value>)',
        'tone-cyan-line': 'rgb(var(--tone-cyan-line) / <alpha-value>)',
        'tone-slate': 'rgb(var(--tone-slate) / <alpha-value>)',
        'tone-slate-line': 'rgb(var(--tone-slate-line) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};