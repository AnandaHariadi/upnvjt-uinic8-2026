import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Accessibility: default gray-400 (#9CA3AF) is ~2.5:1 on white; darkened so
        // secondary text meets WCAG AA (4.5:1). Use gray-300 or white/xx on dark surfaces.
        gray: { ...colors.gray, 400: "#6B7280" },
        // PACUL Design System — core tokens
        primary: {
          DEFAULT: "#2D5F3F",
          light: "#A8D5BA",
        },
        "primary-light": "#A8D5BA",
        accent: "#7AC74F",
        "bg-base": "#F5F5F5",
        "bg-white": "#FFFFFF",
        "text-dark": "#1A1A1A",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        surface: "#FFFFFF",
        // shadcn/ui CSS-variable-based tokens (kept for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "16px",
        card: "12px",
        // keep shadcn var-based alias
        DEFAULT: "var(--radius)",
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', "var(--font-jakarta)", "system-ui", "sans-serif"],
        sans: ['"Plus Jakarta Sans"', "var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["2rem", { fontWeight: "700", lineHeight: "1.2" }],
        h2: ["1.75rem", { fontWeight: "700", lineHeight: "1.25" }],
        h3: ["1.5rem", { fontWeight: "700", lineHeight: "1.3" }],
        body: ["1rem", { fontWeight: "400", lineHeight: "1.6" }],
        small: ["0.875rem", { fontWeight: "400", lineHeight: "1.5" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
