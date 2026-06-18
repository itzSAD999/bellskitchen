/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand warm palette
        brand: {
          50:  '#fff8ed',
          100: '#ffefd4',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#d97706',   // Primary vibrant orange
          600: '#b45309',   // Hover orange
          700: '#92400e',
          800: '#78350f',
          900: '#431407',   // Deep Chocolate Brown
          950: '#2a0e05',   // Extra dark chocolate
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Neutral warm dark tones for text
        dark: {
          50:  '#f8f7f4',
          100: '#edeae4',
          200: '#ded8cc',
          300: '#caa382',
          400: '#b28e6e',
          500: '#9b7654',
          600: '#876247',
          700: '#704f39',
          800: '#5a3f2e',
          900: '#4a3327',
          950: '#1b120f',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Courier New"', 'monospace'],
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'warm':    '0 10px 30px -5px rgba(249, 127, 10, 0.12), 0 4px 12px -2px rgba(249, 127, 10, 0.08)',
        'warm-lg': '0 20px 40px -10px rgba(249, 127, 10, 0.22), 0 8px 16px -4px rgba(249, 127, 10, 0.12)',
        'card':    '0 12px 30px -4px rgba(27, 18, 15, 0.03), 0 4px 12px -2px rgba(27, 18, 15, 0.02)',
        'card-lg': '0 24px 50px -8px rgba(27, 18, 15, 0.06), 0 8px 24px -4px rgba(27, 18, 15, 0.04)',
      },
      animation: {
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':    'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-sm':  'bounceSm 0.4s ease-in-out',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)',     opacity: '1' },
        },
        bounceSm: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.04)' },
        },
      },
    },
  },
  plugins: [],
};
