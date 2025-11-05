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
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        primary: ["Poppins", ...defaultTheme.fontFamily.sans],
        secondary: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: colors.violet[500],
        secondary: colors.rose[500],
        accent: colors.emerald[400],
        gray: {
          100: colors.slate[50],
        },
      },
    },
  },
  plugins: [],
}
