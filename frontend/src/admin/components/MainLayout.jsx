// ══════════════════════════════════════════════
//  ADMIN — MainLayout.jsx  (Redefined)
// ══════════════════════════════════════════════

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header  from "./Header";
import FloatingChatbot from "../../shared/components/FloatingChatbot";

const PAGE_TITLES = {
  "admin-dashboard":      "Command Center",
  "admin-users":          "User Ecosystem",
  "admin-management":     "Intern Registry",
  "admin-knowledge":      "Knowledge Base",
  "admin-reports":        "Audit Reports",
  "admin-analytics":      "Intelligence",
  "admin-announcements":  "Broadcasts",
  "admin-settings":       "System Preferences",
};

const MainLayout = ({ page, onNavigate, onLogout, children }) => {
  const title = PAGE_TITLES[page] ?? "Admin";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block w-72 flex-shrink-0 relative z-50">
         <Sidebar active={page} onNavigate={onNavigate} onLogout={onLogout} />
      </div>

      {/* Sidebar - Mobile Sliding Drawer */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Slide-out Sidebar Container */}
          <div className="relative w-72 max-w-[80vw] h-full flex flex-col bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar 
              active={page} 
              onNavigate={(pageId) => {
                onNavigate(pageId);
                setIsSidebarOpen(false); // Auto-close drawer on navigation
              }} 
              onLogout={onLogout} 
            />
          </div>
        </div>
      )}
      
      {/* Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header title={title} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 lg:p-10">
          <div className="max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
             {children}
          </div>
        </main>
      </div>

      {/* Floating Chatbot helper */}
      <FloatingChatbot />
    </div>
  );
};

export default MainLayout;