/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      // Brand Colors - Miracute Palette
      colors: {
        'brand': {
          'pink': '#E8D5D5',      // Primary soft pink
          'sage': '#B8C4C2',      // Primary sage green
          'cream': '#F4F1ED',     // Background cream
          'warm': '#E6D7C3',      // Warm beige
          'brown': '#8B5A3C',     // Accent brown
        },
        // Neutral palette
        'neutral': {
          50: '#F9F9F7',
          100: '#F4F1ED',
          200: '#E8E3DC',
          300: '#D9D1C7',
          400: '#C8BBB0',
          500: '#A69B8F',
          600: '#8B7D71',
          700: '#716055',
          800: '#5A4D42',
          900: '#463B32',
        }
      },
      // Typography
      fontFamily: {
        'heading': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Custom border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      // Custom shadows
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'large': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(184, 196, 194, 0.3)',
        'glow-pink': '0 0 20px rgba(232, 213, 213, 0.4)',
      },
      // Custom gradients
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #F4F1ED 0%, #E6D7C3 100%)',
        'hero-gradient': 'linear-gradient(135deg, #F9F9F7 0%, #F4F1ED 50%, #E8D5D5 100%)',
        'cta-gradient': 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      },
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        bounceGentle: {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': { 
            transform: 'translateY(-5px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          }
        }
      },
      // Custom transitions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Custom aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
      // Custom z-index values
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Custom line heights for better typography
      lineHeight: {
        'extra-loose': '2.5',
        '12': '3rem',
      },
      // Custom letter spacing
      letterSpacing: {
        'extra-wide': '0.1em',
      },
      // Custom screens for better responsive design
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      // Custom blur values
      blur: {
        'xs': '2px',
      },
      // Custom backdrop blur
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    // Add any additional Tailwind plugins here
    require('@tailwindcss/forms')({
      strategy: 'class', // only generate classes
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Add line clamp plugin for text truncation
    require('@tailwindcss/line-clamp'),
  ],
  // Optimize for production
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Custom utilities
  corePlugins: {
    // Disable some core plugins if not needed
    // container: false,
  },
}