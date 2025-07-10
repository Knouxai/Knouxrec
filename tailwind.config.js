/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./elysian-canvas/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // KNOUX Brand Colors
        "knoux-purple": "#8b5cf6",
        "knoux-neon": "#00d9ff",
        "knoux-dark": "#0f0f23",
        "knoux-light": "#1a1a2e",

        // Extended Color Palette
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.1)",
          medium: "rgba(255, 255, 255, 0.15)",
          dark: "rgba(0, 0, 0, 0.1)",
        },
      },

      fontFamily: {
        orbitron: ["Orbitron", "monospace"],
        rajdhani: ["Rajdhani", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-glass":
          "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "gradient-knoux": "linear-gradient(45deg, #8b5cf6, #00d9ff)",
        "gradient-dark": "linear-gradient(145deg, #0f0f23 0%, #1a1a2e 100%)",
      },

      backdropBlur: {
        glass: "25px",
        strong: "40px",
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        shimmer: "shimmer 2s linear infinite",
        "bounce-slow": "bounce 3s infinite",
        "spin-slow": "spin 8s linear infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-out": "fadeOut 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "scale-out": "scaleOut 0.2s ease-in",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-20px) rotate(1deg)" },
          "66%": { transform: "translateY(10px) rotate(-1deg)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px #8b5cf6" },
          "100%": { boxShadow: "0 0 40px #8b5cf6, 0 0 60px #8b5cf6" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.8)", opacity: "0" },
        },
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      boxShadow: {
        glass: "0 8px 32px 0 rgba(139, 92, 246, 0.1)",
        "glass-lg": "0 20px 60px 0 rgba(139, 92, 246, 0.15)",
        neon: "0 0 20px rgba(139, 92, 246, 0.5)",
        "neon-lg": "0 0 40px rgba(139, 92, 246, 0.7)",
        "neon-blue": "0 0 20px rgba(0, 217, 255, 0.5)",
        "inner-glass": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)",
      },

      blur: {
        "4xl": "80px",
      },

      scale: {
        102: "1.02",
        98: "0.98",
      },

      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },

      screens: {
        xs: "475px",
        "3xl": "1600px",
        "4xl": "1920px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".glass-effect": {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(25px)",
          "-webkit-backdrop-filter": "blur(25px)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 12px 40px rgba(139, 92, 246, 0.1)",
        },
        ".glass-hover": {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            background: "rgba(139, 92, 246, 0.1)",
            borderColor: "#8b5cf6",
            boxShadow: "0 20px 60px rgba(139, 92, 246, 0.2)",
            transform: "translateY(-2px)",
          },
        },
        ".text-gradient": {
          background: "linear-gradient(45deg, #8b5cf6, #00d9ff)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".bg-gradient-knoux": {
          background: "linear-gradient(45deg, #8b5cf6, #00d9ff)",
        },
        ".bg-glass": {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
        },
        ".border-glass": {
          border: "1px solid rgba(139, 92, 246, 0.3)",
        },
        ".shadow-glass": {
          boxShadow: "0 8px 32px rgba(139, 92, 246, 0.1)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
  darkMode: "class",
};
