import React, { useState } from "react";
import { Bell, Search, LayoutGrid } from "lucide-react";
import { ThemeToggle, Avatar } from "../../shared/components/UI";
import { useUser } from "../../context/UserContext";

const NOTIFS = [
  { text: "Your Week 1 report has been reviewed",   time: "5m ago",  dot: "orange" },
  { text: "Meeting reminder: Monday 10 AM standup", time: "1h ago",  dot: "green"  },
  { text: "New Knowledge Base article published",   time: "3h ago",  dot: "green"  },
];

const Header = ({ title }) => {
  const { user } = useUser();
  const [showNotif, setShowNotif] = useState(false);

  const getInitials = (name) => {
    return name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "UN";
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
      <div className="flex-1">
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 lg:hidden">
              <LayoutGrid size={20} />
           </div>
           <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>{title}</h1>
        </div>
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