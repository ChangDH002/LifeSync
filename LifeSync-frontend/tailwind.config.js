/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6B8E61',
        secondary: '#D97757',
        base: '#FDFBF7',
        content: '#333333',
        success: '#4A6741',
        danger: '#C0392B',
      },
      fontSize: {
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      spacing: {
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      minHeight: {
        button: '44px',
      },
    },
  },
  plugins: [],
}
