/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Archivo"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        border: 'var(--color-border)',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          ink: 'var(--color-accent-ink)',
        },
        steel: 'var(--color-steel)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      backgroundImage: {
        pegboard: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
      },
      backgroundSize: {
        pegboard: '16px 16px',
      },
    },
  },
  plugins: [],
}
