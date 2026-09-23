import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FDF8ED',      // Royal warm golden ivory / parchment base
          secondary: '#F5ECD7',    // Slightly deeper golden sand / parchment accent
          tertiary: '#EFE1C3',     // Warm amber parchment
          card: '#FFFDF9',         // Pure luminous warm ivory card surface
          hover: '#F2E5CC',        // Hover warm golden tint
          parchment: '#FBF3DF',   // Distinct parchment shade
        },
        accent: {
          marigold: '#E65100',     // Rich festival marigold orange
          'marigold-light': '#FF7A00',
          'marigold-dark': '#B23B00',
          pink: '#D81B60',         // Vibrant royal Rani pink
          'pink-light': '#F06292',
          'pink-dark': '#AD1457',
          gold: '#C59B27',         // Imperial Indian gold
          'gold-light': '#E5BE4A',
          'gold-dark': '#9A7718',
          peacock: '#0D7685',      // Royal peacock teal / lapis
          'peacock-light': '#26A69A',
          'peacock-dark': '#004D40',
        },
        text: {
          primary: '#2A1810',      // Deep royal espresso/charcoal for crystal clarity
          secondary: '#664938',    // Warm earthy bronze
          muted: '#967A66',        // Elegant muted golden-brown
          gold: '#B8860B',         // Radiant dark gold
        },
        border: {
          primary: '#EADBBF',      // Delicate warm golden border
          accent: '#D4AF37',       // Royal metallic gold
          glow: '#E6510040',
        },
        status: {
          online: '#16A34A',
          away: '#D97706',
          offline: '#9CA3AF',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-marigold': 'linear-gradient(135deg, #FF8C00, #FFA333)',
        'gradient-pink': 'linear-gradient(135deg, #D81B60, #FF4DA6)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37, #F5D77F)',
        'gradient-festival': 'linear-gradient(135deg, #E65100 0%, #D81B60 50%, #C59B27 100%)',
        'gradient-card': 'linear-gradient(145deg, #FFFDF9 0%, #FAF3E3 100%)',
        'mesh-bg': `radial-gradient(ellipse at 20% 30%, #FF8C0018 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 20%, #D81B6015 0%, transparent 60%),
                    radial-gradient(ellipse at 60% 80%, #D4AF3720 0%, transparent 60%)`,
      },
      boxShadow: {
        'marigold': '0 4px 20px rgba(230, 81, 0, 0.25)',
        'marigold-lg': '0 8px 30px rgba(230, 81, 0, 0.35)',
        'pink': '0 4px 20px rgba(216, 27, 96, 0.25)',
        'pink-lg': '0 8px 30px rgba(216, 27, 96, 0.35)',
        'gold': '0 4px 20px rgba(197, 155, 39, 0.3)',
        'card': '0 4px 20px rgba(140, 100, 40, 0.08), 0 1px 3px rgba(140, 100, 40, 0.05)',
        'card-hover': '0 10px 30px rgba(140, 100, 40, 0.15), 0 0 15px rgba(212, 175, 55, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'border-spin': 'borderSpin 3s linear infinite',
        'dandiya-click': 'dandiayaClick 0.8s ease-in-out infinite',
        'diya-pulse': 'diyaPulse 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'confetti': 'confetti 1.5s ease-out forwards',
        'geometric-rotate': 'geometricRotate 20s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(230,81,0,0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(230,81,0,0.4), 0 0 50px rgba(216,27,96,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderSpin: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        dandiayaClick: {
          '0%': { transform: 'rotate(-15deg)' },
          '50%': { transform: 'rotate(15deg)' },
          '100%': { transform: 'rotate(-15deg)' },
        },
        diyaPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(0.96)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.5) rotate(360deg)', opacity: '0' },
        },
        geometricRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};

export default config;
