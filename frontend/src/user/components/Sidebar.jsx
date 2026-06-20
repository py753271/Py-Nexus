// ══════════════════════════════════════════════
//  USER — Sidebar.jsx  (CSS Variable Driven)
// ══════════════════════════════════════════════

import React, { useState } from "react";
import {
  LayoutDashboard, BookOpen, MessageSquare, FileText,
  Bot, Megaphone, BarChart2, User, Settings,
  ChevronRight, ChevronLeft, LogOut, Zap, ClipboardList
} from "lucide-react";

const USER_MENU = [
  { id: "dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { id: "knowledge",      label: "Knowledge Base", icon: BookOpen        },
  { id: "qa",             label: "Q&A Forum",      icon: MessageSquare   },
  { id: "reports",        label: "My Reports",     icon: FileText        },
  { id: "tasks",          label: "My Tasks",       icon: ClipboardList   },
  { id: "meetings",       label: "AI Assistant",   icon: Bot             },
  { id: "announcements",  label: "Announcements",  icon: Megaphone       },
  { id: "analytics",      label: "Analytics",      icon: BarChart2       },
  { id: "profile",        label: "Profile",        icon: User            },
  { id: "settings",       label: "Settings",       icon: Settings        },
];

const Sidebar = ({ active, onNavigate, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen flex flex-col transition-all duration-500 flex-shrink-0 z-50 sticky top-0 ${collapsed ? "w-20" : "w-72"}`}
      style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}
    >
      {/* Branding Section */}
      <div className="h-20 flex items-center justify-between px-6 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Py Nexus Logo" className="h-11 w-auto object-contain" />
          </div>
        ) : (
          <div className="flex items-center justify-center mx-auto">
             <img src="/logo-icon.png" alt="Py Nexus Icon" className="h-10 w-10 object-contain" />
          </div>
        )}

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg transition-all active:scale-90"
            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-4">
           <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg transition-all active:scale-90"
            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {USER_MENU.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all relative overflow-hidden active:scale-95`}
              style={{
                background: isActive ? '#ff6d34' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--muted)',
                boxShadow: isActive ? '0 12px 28px -4px rgba(255,109,52,0.4)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--background)';
                  e.currentTarget.style.color = '#ff6d34';
                  e.currentTarget.style.paddingLeft = '1.25rem';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--muted)';
                  e.currentTarget.style.paddingLeft = '1rem';
                }
              }}
            >
              {/* Left Accent Bar on Hover/Active */}
              <div 
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ${isActive ? 'h-6 bg-white/40' : 'h-0 bg-orange-500 group-hover:h-6'}`}
              />

              <Icon 
                size={20} 
                className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              
              {!collapsed && (
                <span className={`truncate tracking-tight transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                  {item.label}
                </span>
              )}

              {isActive && !collapsed && (
                 <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
              )}

              {collapsed && (
                <div
                  className="absolute left-full ml-4 px-3 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-2xl"
                  style={{ background: '#0f172a' }}
                >
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div className="flex items-center justify-around px-2 mb-2">
            <a href="#" className="p-1.5 rounded-lg hover:bg-orange-500/10 transition-colors" title="GitHub">
              <svg className="w-5 h-5 fill-current text-muted"><use xlinkHref="/icons.svg#github-icon" /></svg>
            </a>
            <a href="#" className="p-1.5 rounded-lg hover:bg-orange-500/10 transition-colors" title="Discord">
              <svg className="w-5 h-5 fill-current text-muted"><use xlinkHref="/icons.svg#discord-icon" /></svg>
            </a>
            <a href="#" className="p-1.5 rounded-lg hover:bg-orange-500/10 transition-colors" title="X (Formerly Twitter)">
              <svg className="w-5 h-5 fill-current text-muted"><use xlinkHref="/icons.svg#x-icon" /></svg>
            </a>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          <LogOut size={20} />
          {!collapsed && <span>Security Exit</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;