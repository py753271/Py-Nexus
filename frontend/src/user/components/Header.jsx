import React, { useState } from "react";
import { Bell, Search, LayoutGrid, Menu } from "lucide-react";
import { ThemeToggle, Avatar } from "../../shared/components/UI";
import { useUser } from "../../context/UserContext";

const NOTIFS = [
  { text: "Your Week 1 report has been reviewed",   time: "5m ago",  dot: "orange" },
  { text: "Meeting reminder: Monday 10 AM standup", time: "1h ago",  dot: "green"  },
  { text: "New Knowledge Base article published",   time: "3h ago",  dot: "green"  },
];

const Header = ({ title, onMenuClick }) => {
  const { user } = useUser();
  const [showNotif, setShowNotif] = useState(false);

  const getInitials = (name) => {
    return name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "UN";
  };

  return (
    <header
      className="h-20 flex items-center px-4 md:px-8 gap-4 md:gap-6 flex-shrink-0 sticky top-0 z-40 transition-all duration-300"
      style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex-1 flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-95 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40"
        >
          <Menu size={20} />
        </button>
        <img src="/logo-icon.png" alt="Py Nexus" className="lg:hidden h-8 w-auto object-contain" />
        <div className="lg:hidden w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />
        
        <h1 className="text-lg md:text-xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        {/* User Identity */}
        <div className="flex items-center gap-3 pl-4 ml-1" style={{ borderLeft: '1px solid var(--border)' }}>
          <div className="hidden md:block text-right">
            <p className="text-xs font-black leading-tight" style={{ color: 'var(--foreground)' }}>{user?.name || "Guest"}</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: 'var(--muted)' }}>{user?.role || "Intern"}</p>
          </div>
          <Avatar initials={getInitials(user?.name)} size="md" />
        </div>
      </div>
    </header>
  );
};

export default Header;