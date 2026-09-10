/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        falcon: {
          bg: '#F7F5F0',
          surface: '#FFFFFF',
          muted: '#F1EEE8',
          elevated: '#EAE6DF',
          border: 'rgba(23, 21, 20, 0.08)',
          'border-active': 'rgba(232, 93, 34, 0.4)',
        },
        accent: {
          DEFAULT: '#E85D22',
          hover: '#F06A2A',
          bright: '#FF7A38',
          subtle: '#F59A52',
          dim: 'rgba(232, 93, 34, 0.08)',
          glow: 'rgba(232, 93, 34, 0.25)',
        },
        status: {
          danger: '#D9362E',
          warning: '#D98B16',
          safe: '#2E9B68',
          info: '#3478C8',
        },
        text: {
          primary: '#171514',
          secondary: '#68635E',
          muted: '#9E9790',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 4px 20px -2px rgba(23, 21, 20, 0.05), 0 1px 3px 0 rgba(23, 21, 20, 0.03)',
        'glass-elevated': '0 10px 30px -4px rgba(23, 21, 20, 0.08), 0 2px 6px 0 rgba(23, 21, 20, 0.04)',
        'glass-hover': '0 14px 40px -4px rgba(23, 21, 20, 0.12), 0 4px 12px 0 rgba(23, 21, 20, 0.06)',
        'accent-glow': '0 8px 24px -4px rgba(232, 93, 34, 0.35)',
      },
    },
  },
  plugins: [],
};
