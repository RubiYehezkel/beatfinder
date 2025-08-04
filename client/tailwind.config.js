const { addDynamicIconSelectors } = require("@iconify/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    screens: {
      xs: "360px", // Extra small screens (phones)
      sm: "640px", // Small screens (tablets)
      md: "768px", // Medium screens (small laptops)
      lg: "1024px", // Large screens (laptops/desktops)
      xl: "1280px", // Extra large screens (large desktops)
    },
    extend: {
      colors: {
        "beatfinder-blue": "#00F0FF",
        "beatfinder-green": "#A6FF00",
        "spotify-green": "#1ed760",
        "spotify-green-hover": "#1DB954",
        "apple-music-red": "#f94c57",
        "apple-music-red-hover": "#fc3c44",
      },
    },
    fontFamily: {
      headers: ["Bebas Neue"],
      roboto: ["Roboto", "sans-serif"],
      syne: ["Syne", "sans-serif"],
    },
  },
  plugins: [require("daisyui"), addDynamicIconSelectors()],
};
