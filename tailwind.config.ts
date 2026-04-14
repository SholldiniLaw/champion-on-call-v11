import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}","./src/components/**/*.{js,ts,jsx,tsx,mdx}","./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT:'#0A1F44', 50:'#EEF1F6', 100:'#D0D8E5', 200:'#A1B1CB', 300:'#728AB1', 400:'#3E5C87', 500:'#0A1F44', 600:'#081A3A', 700:'#061530', 800:'#041026', 900:'#020A1A' },
        crimson: { DEFAULT:'#D71920', 50:'#FDE8E9', 100:'#FAC5C7', 200:'#F28B8F', 300:'#E95157', 400:'#D71920', 500:'#B5151A', 600:'#931115', 700:'#710D10', 800:'#4F090B', 900:'#2D0506' },
      },
      fontFamily: { sans: ['var(--font-sans)','system-ui','sans-serif'], display: ['var(--font-display)','Georgia','serif'] },
      boxShadow: { card:'0 1px 3px rgba(10,31,68,.08),0 1px 2px rgba(10,31,68,.06)', 'card-hover':'0 4px 12px rgba(10,31,68,.12),0 2px 4px rgba(10,31,68,.08)', elevated:'0 10px 40px rgba(10,31,68,.12),0 2px 8px rgba(10,31,68,.06)' },
    },
  },
  plugins: [],
};
export default config;
