import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        display: ["var(--font-outfit)"],
        cinzel: ["var(--font-cinzel)"],
        cormorant: ["var(--font-cormorant)"],
        script: ["var(--font-script)"],
      },
    },
  },
  plugins: [],
};

export default config;
