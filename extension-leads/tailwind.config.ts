import type { Config } from "tailwindcss";

export default {
  content: ["./entrypoints/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        "primary-hover": "#4f46e5",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
    },
  },
} satisfies Config;
