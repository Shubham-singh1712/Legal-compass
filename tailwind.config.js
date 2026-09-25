/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        legal: {
          50: 'rgb(var(--legal-50) / <alpha-value>)',
          100: 'rgb(var(--legal-100) / <alpha-value>)',
          200: 'rgb(var(--legal-200) / <alpha-value>)',
          300: 'rgb(var(--legal-300) / <alpha-value>)',
          400: 'rgb(var(--legal-400) / <alpha-value>)',
          500: 'rgb(var(--legal-500) / <alpha-value>)',
          600: 'rgb(var(--legal-600) / <alpha-value>)',
          700: 'rgb(var(--legal-700) / <alpha-value>)',
          750: 'rgb(var(--legal-750) / <alpha-value>)',
          800: 'rgb(var(--legal-800) / <alpha-value>)',
          850: 'rgb(var(--legal-850) / <alpha-value>)',
          900: 'rgb(var(--legal-900) / <alpha-value>)',
          950: 'rgb(var(--legal-950) / <alpha-value>)',
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          500: '#334E68',
          800: '#102A43',
          900: '#0B1A2C',
          950: '#060D17',
        },
        parchment: {
          50: '#FDFBF7',
          100: '#F7F3EB',
          200: '#EFE8DA',
          800: '#4A4135',
          900: '#2E271D',
        },
        accent: {
          gold: '#D97706',
          amber: '#F59E0B',
          warm: '#FBBF24',
          teal: '#0D9488',
          emerald: '#10B981',
          coral: '#F43F5E',
          blue: '#3B82F6',
          purple: '#8B5CF6',
        },
        'brand-gold': 'rgb(245 158 11 / <alpha-value>)',
        'brand-gold-light': 'rgb(251 191 36 / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle-glow': '0 0 25px -5px rgba(245, 158, 11, 0.12)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.12)',
        'blue-glow': '0 0 25px -5px rgba(59, 130, 246, 0.12)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};
