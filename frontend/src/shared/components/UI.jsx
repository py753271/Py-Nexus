// ══════════════════════════════════════════════
//  SHARED — UI.jsx  (UptoSkills Branded)
// ══════════════════════════════════════════════

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../utils/ThemeContext";

/* ── Avatar ─────────────────────────────────── */
export const Avatar = ({ initials, size = "md" }) => {
  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-20 h-20 text-xl",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm border-2 border-white/20 px-1`}
      style={{ background: "linear-gradient(135deg, #64748b, #475569)" }}
    >
      {initials}
    </div>
  );
};

/* ── Badge ───────────────────────────────────── */
export const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: { background: "rgba(29,78,216,0.1)", color: "#1d4ed8", border: "1px solid rgba(29,78,216,0.2)" },
    success: { background: "rgba(0,190,163,0.1)", color: "#00bea3", border: "1px solid rgba(0,190,163,0.2)" },
    warning: { background: "rgba(255,109,52,0.1)", color: "#ff6d34", border: "1px solid rgba(255,109,52,0.2)" },
    danger:  { background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" },
    purple:  { background: "rgba(124,58,237,0.1)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.2)" },
    gray:    { background: "rgba(100,116,139,0.1)", color: "#64748b", border: "1px solid rgba(100,116,139,0.2)" },
  };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide"
      style={variants[variant] || variants.default}
    >
      {children}
    </span>
  );
};

/* ── Card ────────────────────────────────────── */
export const Card = ({ children, className = "", hover = false, onClick, style = {} }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl transition-all duration-300 ${className}`}
    style={{
      background: "var(--card)",
      color: "var(--card-foreground)",
      border: "1px solid var(--border)",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.02)",
      cursor: onClick || hover ? "pointer" : "default",
      ...style
    }}
    onMouseEnter={e => {
      if (hover || onClick) {
        e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.01)";
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "#ff6d3444";
      }
    }}
    onMouseLeave={e => {
      if (hover || onClick) {
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.02)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
      }
    }}
  >
    {children}
  </div>
);

/* ── StatCard ────────────────────────────────── */
export const StatCard = ({ title, value, icon: Icon, trend, color = "#64748b", subtitle }) => (
  <Card className="p-6 overflow-hidden relative group">
    <div
      className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 group-hover:opacity-10 transition-opacity rounded-full"
      style={{ background: color }}
    />

    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>{title}</p>
        <p className="text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>{value}</p>
        {subtitle && <p className="text-xs mt-1 font-medium" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      </div>
      <div
        className="p-3 rounded-xl shadow-inner transition-transform group-hover:scale-110"
        style={{
          background: color === "#ff6d34" ? "rgba(255,109,52,0.15)" : color === "#00bea3" ? "rgba(0,190,163,0.15)" : `${color}25`
        }}
      >
        <Icon size={22} style={{ color }} strokeWidth={2.5} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1.5 mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10">
          <span className="text-[10px]" style={{ color: "#00bea3" }}>↑</span>
        </div>
        <span className="text-xs font-bold" style={{ color: "#00bea3" }}>{trend}</span>
      </div>
    )}
  </Card>
);

/* ── Toggle ──────────────────────────────────── */
export const Toggle = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className="w-11 h-6 rounded-full relative transition-colors duration-200"
    style={{ background: checked ? "var(--accent, #ff6d34)" : "#d1d5db" }}
  >
    <div
      className="w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-transform duration-200"
      style={{ transform: checked ? "translateX(24px)" : "translateX(4px)" }}
    />
  </button>
);

/* ── SectionHeader ───────────────────────────── */
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>{title}</h2>
      {subtitle && <p className="text-sm font-medium mt-1" style={{ color: "var(--muted)" }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

/* ── PrimaryButton ───────────────────────────── */
export const PrimaryButton = ({ children, onClick, className = "", icon: Icon, style = {} }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all ${className}`}
    style={{ background: "linear-gradient(135deg, #ff6d34, #ff8255)", ...style }}
  >
    {Icon && <Icon size={16} strokeWidth={2.5} />}
    {children}
  </button>
);

/* ── GreenButton ─────────────────────────────── */
export const GreenButton = ({ children, onClick, className = "", icon: Icon, style = {} }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all ${className}`}
    style={{ background: "linear-gradient(135deg, #00bea3, #15d1b7)", ...style }}
  >
    {Icon && <Icon size={16} strokeWidth={2.5} />}
    {children}
  </button>
);

/* ── ThemeToggle ─────────────────────────────── */
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-90"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};