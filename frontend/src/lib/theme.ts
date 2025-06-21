// src/lib/theme.ts

export const themeClasses = {
  // page / section backgrounds
  pageBg:           "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
  overlayGradient:  "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/50 to-slate-950",
  gridPattern:      "bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]",

  // orbs
  orb: {
    blue:   "bg-blue-500",
    purple: "bg-purple-500",
    pink:   "bg-pink-500",
  },

  // text
  text: {
    primary:   "text-white",
    secondary: "text-slate-300",
    tertiary:  "text-slate-400",
    accent:    "text-blue-400",
    accentHover: "group-hover:text-blue-300",
  },

  // badges
  badge: {
    base:  "bg-blue-500/20 border-blue-500/30",
    hover: "hover:bg-blue-500/30",
    text:  "text-blue-300",
  },

  // cards
  card: {
    base:        "bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-0 backdrop-blur-xl",
    hoverBg:     "hover:from-slate-800/60 hover:to-slate-700/60",
    hoverScale:  "hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20",
    overlay:     "absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100",
  },

  // buttons
  button: {
    primary:     "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
    outline:     "border-slate-600 text-slate-300 hover:bg-slate-800",
    playDemo:    "bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30",
  },
};

export const themeHex = {
  slate: {
    950: "#0f172a",
    900: "#111827",
    800: "#1f2937",
    700: "#374151",
    600: "#4b5563",
    500: "#6b7280",
    300: "#d1d5db",
    400: "#9ca3af",
  },
  blue: {
    900: "#1e3a8a",
    700: "#1d4ed8",
    600: "#2563eb",
    500: "#3b82f6",
    400: "#60a5fa",
    300: "#93c5fd",
  },
  purple: {
    700: "#7e22ce",
    600: "#9333ea",
    500: "#a855f7",
  },
  pink: {
    500: "#ec4899",
  },
  green: {
    500: "#10b981",
  },
  white:     "#ffffff",
  transparentWhite02: "rgba(255,255,255,0.02)",
};
