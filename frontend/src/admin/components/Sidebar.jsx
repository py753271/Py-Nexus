// ══════════════════════════════════════════════
//  ADMIN — Sidebar.jsx  (Command Tower Design)
// ══════════════════════════════════════════════

import React, { useState } from "react";
import {
  LayoutDashboard, Users, BookOpen, FileText,
  BarChart2, Megaphone, Settings, Shield,
  ChevronRight, ChevronLeft, LogOut, Activity,
  Cpu, User, ClipboardList
} from "lucide-react";

const ADMIN_MENU = [
  { id: "admin-dashboard",      label: "Command Center",    icon: LayoutDashboard },
  { id: "admin-users",          label: "User Ecosystem",    icon: Users           },
  { id: "admin-management",     label: "Intern Registry",   icon: Shield          },
  { id: "admin-tasks",          label: "Assignments Console", icon: ClipboardList },
  { id: "admin-knowledge",      label: "Knowledge Base",    icon: BookOpen        },
  { id: "admin-reports",        label: "Audit Reports",     icon: FileText        },
  { id: "admin-analytics",      label: "Intelligence",      icon: BarChart2       },
  { id: "admin-announcements",  label: "Broadcasts",        icon: Megaphone       },
  { id: "admin-profile",        label: "Profile",           icon: User            },
  { id: "admin-settings",       label: "System Config",     icon: Settings        },
];

const Sidebar = ({ active, onNavigate, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  // FORCE DARK THEME COLORS FOR ADMIN CONSOLE
  const THEME = {
    bg: "#020617",
    border: "rgba(255,109,52,0.1)",
    text: "#94a3b8",
    active: "#f97316",
    activeBg: "rgba(255,109,52,0.1)",
    hover: "#ffffff"
  };

  return (
    <aside
      className={`h-screen flex flex-col transition-all duration-500 flex-shrink-0 z-50 sticky top-0 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.5)] ${collapsed ? "w-20" : "w-72"}`}
      style={{ background: THEME.bg, borderRight: `1px solid ${THEME.border}` }}
    >
      {/* Admin Branding */}
      <div className="h-24 flex flex-col justify-center px-6 flex-shrink-0 relative overflow-hidden"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        
        <div className="flex items-center justify-between z-10">
          {!collapsed ? (
            <div className="flex items-center gap-3">
               <img src="/logo.png" alt="Py Nexus Logo" className="h-11 w-auto object-contain" />
               <span className="text-[9px] font-black tracking-[0.2em] text-orange-500 uppercase px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md">ADMIN</span>
            </div>
          ) : (
            <div className="flex items-center justify-center mx-auto">
               <img src="/logo-icon.png" alt="Py Nexus Icon" className="h-10 w-10 object-contain" />
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg transition-all active:scale-90 hover:bg-white/5 text-slate-500"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
      </div>

      {collapsed && (
        <div className="flex justify-center py-4">
           <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg transition-all active:scale-90 hover:bg-white/5 text-slate-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1">
        {ADMIN_MENU.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full group flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold transition-all relative overflow-hidden active:scale-95`}
              style={{
                background: isActive ? THEME.activeBg : 'transparent',
                color: isActive ? THEME.active : THEME.text,
              }}
            >
              <Icon 
                size={18} 
                className={`flex-shrink-0 transition-all duration-500 ${isActive ? 'scale-110 text-orange-500' : 'group-hover:text-white'}`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />

              {!collapsed && (
                <span className={`truncate tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1 group-hover:text-white'}`}>
                  {item.label}
                </span>
              )}

              {isActive && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {!collapsed && (
           <div className="px-4 py-3 rounded-xl flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20">
               <Activity size={14} className="text-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Node Secure</span>
           </div>
        )}
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-red-400"
        >
          <LogOut size={18} />
          {!collapsed && <span>Shutdown</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;