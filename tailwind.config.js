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
      // Brand Colors - Original Project Palette
      colors: {
        'brand': {
          'pink': '#d7c6c8',      // Dusty pink
          'sage': '#bbcfca',      // Sage green  
          'cream': '#cdd3d7',     // Light blue-gray
          'warm': '#e9d1be',      // Warm beige
          'brown': '#955a3f',     // Rich brown
        },
        // Neutral palette based on original colors
        'neutral': {
          50: '#f8f9fa',
          100: '#e9d1be',      // warm beige
          200: '#cdd3d7',      // light blue-gray  
          300: '#bbcfca',      // sage green
          400: '#d7c6c8',      // dusty pink
          500: '#A69B8F',
          600: '#955a3f',      // rich brown
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
        'glow': '0 0 20px rgba(187, 207, 202, 0.3)',
        'glow-pink': '0 0 20px rgba(215, 198, 200, 0.4)',
      },
      // Custom gradients with original colors
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #cdd3d7 0%, #e9d1be 100%)',
        'hero-gradient': 'linear-gradient(135deg, #f8f9fa 0%, #cdd3d7 50%, #d7c6c8 100%)',
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