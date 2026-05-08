/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5C8A6B',
        primaryLight: '#8AB89A',
        primaryPale: '#E8F2EC',
        secondary: '#D4813A',
        teal: '#2D6E6B',
        tealDark: '#1A4A48',
        base: '#FAF7F2',
        surface: '#FFFEF9',
        content: '#1E2D2B',
        contentMid: '#4A5E5C',
        contentLight: '#7A8F8D',
        border: '#D8E8DE',
        success: '#4A6741',
        danger: '#C0392B',
      },
      fontSize: {
        sm: '1rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.375rem',
        '2xl': '1.75rem',
        '3xl': '2.125rem',
        '4xl': '3rem',
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
      boxShadow: {
        card: '0 4px 24px rgba(44, 110, 107, 0.10)',
        cardLg: '0 8px 48px rgba(44, 110, 107, 0.16)',
        hero: '0 6px 24px rgba(92, 138, 107, 0.4)',
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'Pretendard', 'Apple SD Gothic Neo', 'sans-serif'],
        serif: ['Noto Serif KR', 'serif'],
      },
    },
  },
  plugins: [],
}
