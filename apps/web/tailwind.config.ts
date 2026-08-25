import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3869D2',
          'blue-light': '#5a8aee',
          'blue-dark': '#2a50a8',
          purple: '#C57CF9',
          'purple-light': '#d9a4ff',
          'purple-dark': '#a35ed4',
        },
        dark: {
          bg: '#000000',
          1: '#050510',
          2: '#0a0a1a',
          3: '#0f0f24',
          4: '#14142e',
          5: '#1a1a38',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xs': '6px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'full': '100px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'blue-glow': '0 4px 24px rgba(56, 105, 210, 0.4)',
        'purple-glow': '0 4px 24px rgba(197, 124, 249, 0.4)',
        'mixed-glow': '0 4px 30px rgba(56, 105, 210, 0.2), 0 4px 30px rgba(197, 124, 249, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
