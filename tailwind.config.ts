import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        velvet: "#AB345C",
        midnight: "#23174E"
      },
      fontFamily: {
        sans: ['var(--font-euclid-circular)'],
        serif: ['var(--font-gt-super)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
