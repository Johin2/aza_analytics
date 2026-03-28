/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aza Fashions Luxury Color Palette
        aza: {
          // Primary colors
          'primary': '#BC3D19',      // Burnt Terracotta
          'secondary': '#EC7C5D',    // Warm Coral
          'success': '#388E3C',      // Sage Green
          'warning': '#D7BA54',      // Luxury Gold
          'danger': '#DC2626',       // Red
          'info': '#2563EB',         // Blue
          'neutral': '#737373',      // Text Light

          // Aza brand colors
          'terracotta': '#BC3D19',     // Primary brand
          'coral': '#EC7C5D',          // Secondary brand
          'blush': '#FFF3F0',          // Warm tint BG
          'sage': '#388E3C',           // Success green
          'navy': '#1A1A2E',           // Dark navy
          'gold': '#D7BA54',           // Luxury gold

          // Shades for UI elements
          'primary-light': '#D4654A',
          'primary-dark': '#9A3215',
          'secondary-light': '#F09D85',
          'secondary-dark': '#D4654A',
          'success-light': '#4CAF50',
          'success-dark': '#2E7D32',
          'warning-light': '#E5CC72',
          'warning-dark': '#C9A832',
          'danger-light': '#EF4444',
          'danger-dark': '#B91C1C',
          'info-light': '#3B82F6',
          'info-dark': '#1D4ED8',
        },
        // Legacy foo-* aliases for compatibility
        foo: {
          'fortune-red': '#BC3D19',
          'sunset-mandarin': '#EC7C5D',
          'sakura-pink': '#FFF3F0',
          'bamboo-green': '#388E3C',
          'mist-blue': '#1A1A2E',
          'golden-sesame': '#D7BA54',
        },
        // Primary color scale
        primary: {
          50: '#FFF3F0',
          100: '#FFE4DE',
          200: '#FFC9B8',
          300: '#F09D85',
          400: '#EC7C5D',
          500: '#D4654A',
          600: '#BC3D19', // Main primary (Terracotta)
          700: '#9A3215',
          800: '#7A2811',
          900: '#5C1E0D',
        },
        // Secondary color scale
        secondary: {
          50: '#FFF7F5',
          100: '#FFEDE8',
          200: '#FFDBD1',
          300: '#F9C4B5',
          400: '#F09D85',
          500: '#EC7C5D', // Main secondary (Coral)
          600: '#D4654A',
          700: '#BC3D19',
          800: '#9A3215',
          900: '#7A2811',
        },
        // Success (Sage Green) scale
        success: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#388E3C', // Main success
          600: '#2E7D32',
          700: '#1B5E20',
          800: '#145218',
          900: '#0D3B12',
        },
        // Warning (Gold) scale
        warning: {
          50: '#FDF8E8',
          100: '#F9F0C4',
          200: '#F0E09A',
          300: '#E5CC72',
          400: '#D7BA54', // Main warning (Gold)
          500: '#C9A832',
          600: '#B8962A',
          700: '#9A7E22',
          800: '#7C661B',
          900: '#5E4E14',
        },
        // Danger (Red) scale
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626', // Main danger
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        }
      },
      fontFamily: {
        // Be Vietnam Pro for Aza Fashions branding
        sans: ['Be Vietnam Pro', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(188, 61, 25, 0.3)',
      },
    },
  },
  plugins: [],
}
