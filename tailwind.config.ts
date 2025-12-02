import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5B',
          dark: '#E55A2B',
        },
        secondary: {
          DEFAULT: '#2C3E50',
          light: '#34495E',
          dark: '#1A252F',
        },
        navy: {
          DEFAULT: '#1E3A5F',
          light: '#2C4A6F',
          dark: '#142A4F',
        },
        charcoal: {
          DEFAULT: '#36454F',
          light: '#4A5A66',
          dark: '#2A3439',
        },
        background: {
          DEFAULT: '#FAFBFC',
          dark: '#F5F6F7',
        },
      },
      fontFamily: {
        sans: ['var(--font-futura)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        japanese: ['var(--font-noto-sans-jp)', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'sans-serif'],
        futura: ['var(--font-futura)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        noto: ['var(--font-noto-sans-jp)', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;