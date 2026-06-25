/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fbf4',
          100: '#dcf5e3',
          200: '#b9ebc9',
          300: '#8ddca8',
          400: '#5ec682',
          500: '#3aab63',
          600: '#1f8c4d',
          700: '#1a703f',
          800: '#185a35',
          900: '#0f3d23'
        },
        cream: {
          50: '#fffaf3',
          100: '#fdf2e1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px 0 rgba(16, 24, 40, 0.04)'
      }
    }
  },
  plugins: []
}
