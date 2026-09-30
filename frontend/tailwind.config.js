/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",   // ← class-based dark mode (toggled by adding 'dark' to <html>)
  theme: {
    extend: {
      colors: {
        // ECO-PULSE brand palette
        brand: {
          green:   "#22C55E",   // primary accent – nature/green
          teal:    "#14B8A6",   // secondary – sustainability
          amber:   "#F59E0B",   // solar/EV
          sky:     "#38BDF8",   // water/sky
          slate:   "#1E293B",   // dark surface
          cream:   "#FEF3C7",   // warm light bg
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Syne", "Inter", "sans-serif"],
      },
      animation: {
        "fade-in":      "fadeIn 0.5s ease-in-out",
        "slide-up":     "slideUp 0.4s ease-out",
        "pulse-slow":   "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":    "spin 8s linear infinite",
        "louver-open":  "louverOpen 0.6s ease-in-out forwards",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp:   { "0%": { transform: "translateY(20px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
        louverOpen:{ "0%": { transform: "rotateX(0deg)" }, "100%": { transform: "rotateX(90deg)" } },
      },
    },
  },
  plugins: [],
}
