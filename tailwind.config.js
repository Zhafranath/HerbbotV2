/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#1A2F1E",
          100: "#1F3824",
          200: "#25442B",
          300: "#2C5233",
          400: "#36643F",
        },
        sage: {
          50: "#243B27",
          100: "#2C4A31",
          200: "#365C3C",
          300: "#427048",
          400: "#508557",
          500: "#5C9C64",
          600: "#70B078",
          700: "#8BC291",
          800: "#A9D4AE",
          900: "#C8E6CC",
        },
        terracotta: {
          400: "#C08552",
          500: "#D4A373",
          600: "#E0B989",
          700: "#E8CCA0",
        },
        leaf: {
          400: "#508557",
          500: "#5C9C64",
          600: "#427048",
        },
        evergreen: {
          400: "#2C5233",
          500: "#1F3824",
          600: "#152A1B",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3.5rem",
      },
      boxShadow: {
        "soft": "0 2px 20px rgba(0,0,0,.2)",
        "elevated": "0 4px 32px rgba(0,0,0,.25)",
        "glow": "0 0 30px rgba(92,156,100,.08), 0 0 60px rgba(92,156,100,.04)",
        "gold": "0 2px 20px rgba(192,133,82,.12)",
      },
      backgroundImage: {
        "sage-grad": "linear-gradient(135deg, #427048 0%, #508557 50%, #5C9C64 100%)",
        "sage-subtle": "linear-gradient(135deg, #243B27 0%, #1A2F1E 50%, #243B27 100%)",
        "terracotta-grad": "linear-gradient(135deg, #C08552 0%, #D4A373 100%)",
        "panel-grad": "linear-gradient(145deg, #1F3824 0%, #243B27 100%)",
      },
      animation: {
        "float": "float 7s ease-in-out infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
        "drift": "drift 12s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.85" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "33%": { transform: "translate(2%, -1%) rotate(1deg)" },
          "66%": { transform: "translate(-1%, 1%) rotate(-1deg)" },
        },
      },
    },
  },
  plugins: [],
};
