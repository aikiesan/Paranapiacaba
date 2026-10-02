/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidade "acervo histórico": neutros quentes (stone, do Tailwind) +
        // verde-mata ferroviário como cor de estado/ação, a partir do #2D4A3E
        // usado na página inicial, e o marrom-ferrugem #78350F das abas.
        forest: {
          50: '#F1F5F2',
          100: '#DFE9E2',
          200: '#BFD3C6',
          300: '#93B5A1',
          400: '#66937A',
          500: '#457760',
          600: '#355F4D',
          700: '#2D4A3E',
          800: '#243B32',
          900: '#1C2E27',
        },
        rust: {
          50: '#FBF6EF',
          100: '#F5EADB',
          200: '#EAD3B5',
          300: '#D9B187',
          400: '#C08A5A',
          500: '#A0683A',
          600: '#8C5E3C',
          700: '#78350F',
          800: '#5C290B',
          900: '#451A03',
        },
        paper: {
          DEFAULT: '#FAF7F2',
          dark: '#F5F0E6',
          line: '#E7E0D3',
        },
      },
    },
  },
  plugins: [],
}
