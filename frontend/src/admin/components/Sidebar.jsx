import React, { useState } from "react";
import {
  LayoutDashboard, Users, BookOpen, FileText,
  BarChart2, Megaphone, Settings, Shield,
  ChevronRight, ChevronLeft, LogOut, Activity,
  Cpu, User, ClipboardList
} from "lucide-react";
import { useUser } from "../../context/UserContext";

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
  const { user } = useUser();
  const isSuperAdmin = user?.email?.toLowerCase().includes("superadmin");

  const filteredMenu = ADMIN_MENU.filter(item => {
    if (isSuperAdmin) return true;
    // Standard Admins/Teachers cannot manage system users or global preferences
    if (item.id === "admin-users" || item.id === "admin-settings") {
      return false;
    }
    return true;
  });

  return (
    <aside
      className={`h-screen flex flex-col transition-all duration-500 flex-shrink-0 z-50 sticky top-0 shadow-lg ${collapsed ? "w-20" : "w-72"}`}
      style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}
    >
      {/* Admin Branding */}
      <div className="h-24 flex flex-col justify-center px-6 flex-shrink-0 relative overflow-hidden"
        style={{ borderBottom: '1px solid var(--border)' }}>
        
        <div className="flex items-center justify-between z-10">
          {!collapsed ? (
            <div className="flex flex-col gap-1">
               <img src="/logo.png" alt="Py Nexus Logo" className="h-11 w-auto object-contain" />
               <span className={`text-[8px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-md border text-center ${
                 isSuperAdmin 
                   ? "bg-purple-500/15 border-purple-500/30 text-purple-400" 
                   : "bg-orange-500/15 border-orange-500/30 text-orange-400"
               }`}>
                 {isSuperAdmin ? "SUPER ADMIN" : "ADMIN / TEACHER"}
               </span>
            </div>
          ) : (
            <div className="flex items-center justify-center mx-auto">
               <img src="/logo-icon.png" alt="Py Nexus Icon" className="h-10 w-10 object-contain" />
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg transition-all active:scale-90 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500"
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
            className="p-1.5 rounded-lg transition-all active:scale-90 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1">
        {filteredMenu.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full group flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold transition-all relative overflow-hidden active:scale-95`}
              style={{
                background: isActive ? 'rgba(255,109,52,0.1)' : 'transparent',
                color: isActive ? '#f97316' : 'var(--muted)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--background)';
                  e.currentTarget.style.color = '#f97316';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--muted)';
                }
              }}
            >
              <Icon 
                size={18} 
                className={`flex-shrink-0 transition-all duration-500 ${isActive ? 'scale-110 text-orange-500' : 'group-hover:text-orange-500'}`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />

              {!collapsed && (
                <span className={`truncate tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
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

      <div className="p-6 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
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