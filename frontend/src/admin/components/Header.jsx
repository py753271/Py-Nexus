import React, { useState } from "react";
import { Bell, Search, Shield, Zap, Radio } from "lucide-react";
import { ThemeToggle, Avatar, Badge } from "../../shared/components/UI";
import { useUser } from "../../context/UserContext";

const Header = ({ title }) => {
  const { user } = useUser();

  const getInitials = (name) => {
    return name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "AD";
  };

  return (
    <header
      className="h-20 flex items-center px-8 gap-6 flex-shrink-0 sticky top-0 z-40 transition-all duration-300"
      style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex-1 flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 shadow-inner">
           <Radio size={14} className="text-orange-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Secure Node: ACTIVE</span>
        </div>
        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />
        <div>
          <h1 className="text-[10px] font-black uppercase tracking-[0.3em] mb-0.5 text-orange-500">CONTROL TOWER v2.4</h1>
          <p className="text-xl font-black tracking-tighter leading-none" style={{ color: 'var(--foreground)' }}>{title}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {/* Admin Identity */}
        <div className="flex items-center gap-4 pl-6 ml-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden md:block text-right">
            <p className="text-xs font-black leading-tight" style={{ color: 'var(--foreground)' }}>{user?.name || "System Admin"}</p>
            <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Authorized: {user?.role}</p>
            </div>
          </div>
          <Avatar initials={getInitials(user?.name)} size="md" />
        </div>
      </div>
    </header>
  );
};

export default Header;