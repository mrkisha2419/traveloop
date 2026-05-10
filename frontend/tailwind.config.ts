import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#F59E0B",
          secondary: "#0EA5E9",
          accent: "#10B981",
          dark: "#1E293B",
          light: "#F8FAFC"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        travel: "0 20px 50px -24px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: [animate]
} satisfies Config;
