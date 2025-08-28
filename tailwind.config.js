module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./global-components/**/*.{js,jsx,ts,tsx}",
    "./<custom directory>/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#333333",
        background: "#262135", // Deep purple background
        primary: "#6B46C1", // Lighter purple for buttons and accents
        secondary: "#8E23A6", // Slightly darker purple for secondary elements
        surface: "#3A2D6E", // Slightly lighter than background for surfaces
        text: "#FFFFFF", // White text
        textLight: "#A0A0A0", // Light gray for secondary text
        buttonPrimary: "#D6EBEB",
        buttonSecondary: "#494358",
        textYellow: "#F6F3BA",
        gtkfbackground: "#D9D9D9",
        gtkfText: "#C01E65",
      },
      fontFamily: {
        montAlt: ["MontserratAlternates_400Regular"],
      },
    },
  },
  plugins: [],
};
