import type { Config } from "tailwindcss";

// Design tokens sourced directly from docs/02-visual-design-system.md.
// Do not add new colors or type sizes here without updating that document first.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lvinit: {
          black: "#111111",
          white: "#FFFFFF",
          warmgray: "#6E6A63",
          lightgray: "#E8E6E1",
          blue: "#2B6CB0",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Doc 02 §2 scale
        caption: ["13px", { lineHeight: "18px", letterSpacing: "0.06em" }],
        body: ["17px", { lineHeight: "28px" }],
        "body-lg": ["19px", { lineHeight: "30px" }],
        subhead: ["24px", { lineHeight: "32px" }],
        "heading-sm": ["36px", { lineHeight: "42px" }],
        heading: ["52px", { lineHeight: "58px" }],
        // Doc 03 additions — reserved, per §2, for exactly the sections named below
        thesis: ["56px", { lineHeight: "64px" }], // The Thesis Beat only
        scoreboard: ["64px", { lineHeight: "68px" }], // Journey names, Comparison names, the emotional numeral
        display: ["84px", { lineHeight: "88px" }], // Hero + Mikey's name only — see Doc 03 §2
      },
      maxWidth: {
        prose: "700px",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
