/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5F0',
          100: '#FFE8DC',
          200: '#FFD1B8',
          300: '#FFB894',
          400: '#FF9C70',
          500: '#FF6B35',
          600: '#E55A2B',
          700: '#CC4A21',
          800: '#B23A17',
          900: '#992A0D',
        },
        manga: {
          pink: '#FF85A2',
          blue: '#4ECDC4',
          purple: '#9B5DE5',
          yellow: '#FFE066',
          green: '#6BCB77',
        },
        dark: {
          100: '#F8F9FA',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#2D3436',
        },
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', 'cursive'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'coupon-reveal': 'couponReveal 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'progress': 'progress 1.5s ease-out forwards',
        'sparkle': 'sparkle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        couponReveal: {
          '0%': { opacity: '0', transform: 'rotateY(90deg) scale(0.8)' },
          '100%': { opacity: '1', transform: 'rotateY(0) scale(1)' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width, 100%)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-manga': 'linear-gradient(135deg, #FF6B35 0%, #FF85A2 50%, #9B5DE5 100%)',
        'gradient-coupon': 'linear-gradient(135deg, #FFE8DC 0%, #FFF5F0 100%)',
      },
    },
  },
  plugins: [],
};
