import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1360px' },
    },
    extend: {
      colors: {
        gold: {
          50: '#FBF7EA',
          100: '#F6ECCB',
          200: '#EFDE9B',
          300: '#E9D06B',
          400: '#E5B83F',
          500: '#D9A622',
          600: '#B98417',
          700: '#946312',
          800: '#714A0F',
          900: '#4A300A',
        },
        ink: {
          DEFAULT: '#1B1B1D',
          50: '#F5F5F5',
          100: '#E9E9EA',
          200: '#D2D2D4',
          300: '#AFAFB3',
          400: '#84848A',
          500: '#63636A',
          600: '#4A4A51',
          700: '#35353B',
          800: '#252529',
          900: '#1B1B1D',
          950: '#101011',
        },
        sand: {
          50: '#FAF9F7',
          100: '#F4F2EE',
          200: '#E8E5DE',
          300: '#D8D3C8',
        },
        success: { DEFAULT: '#1E8E5A', soft: '#E8F5EF' },
        warning: { DEFAULT: '#B7791F', soft: '#FDF5E4' },
        danger: { DEFAULT: '#B42318', soft: '#FDEDEC' },
        info: { DEFAULT: '#17638F', soft: '#E9F2F9' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'Times New Roman', 'serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(27 27 29 / 0.04), 0 8px 24px -12px rgb(27 27 29 / 0.12)',
        'card-hover': '0 2px 4px 0 rgb(27 27 29 / 0.06), 0 18px 40px -16px rgb(27 27 29 / 0.22)',
        panel: '0 1px 3px 0 rgb(27 27 29 / 0.06), 0 12px 32px -20px rgb(27 27 29 / 0.28)',
        gold: '0 8px 24px -8px rgb(217 166 34 / 0.45)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down': 'slide-down 0.2s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.24, 0, 0.38, 1) infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
