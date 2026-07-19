import type { Config } from 'tailwindcss';

// In Tailwind v4, most configuration is done via @theme in CSS.
// This file is kept for plugin compatibility and content paths.
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
};

export default config;
