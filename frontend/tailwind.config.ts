import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  // O design do 360 Hospitalar vive em styles/globals.css (tokens oklch + 3 temas).
  // Tailwind fica disponível para utilitários pontuais, sem conflitar com o CSS do protótipo.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};

export default config;
