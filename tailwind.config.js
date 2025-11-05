import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", ...defaultTheme.fontFamily.sans],
        primary: ["Sora", ...defaultTheme.fontFamily.sans],
        secondary: ["Plus Jakarta Sans", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: colors.violet[400],
        secondary: colors.rose[400],
        accent: colors.emerald[400],
        gray: {
          100: colors.slate[50],
        },
      },
    },
  },
  plugins: [],
}
