const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', ...defaultTheme.fontFamily.sans],
      },

      maxHeight: {
        "3/4": "85%",
      },
      maxWidth: {
        "custom-max": "1500px",
      },
      colors: {
        lightpitch: "rgba(220, 219, 210, 0.60) 100%)",
        pitch: "#B4B39D",
        white: "#FAFAFA",
        black: "#2B2B2B",
        gray1: "#575757",
        gray2: "#ABABAB",
        gray3: "#E5E5DF",
        gray4: "#C6C3CA",
        gray5: "#949399",
        red: "#D04141",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled", "group-hover"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
