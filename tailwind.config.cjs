/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Enables `text-accent`, `bg-accent/10`, `ring-accent/50`, etc.
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};

