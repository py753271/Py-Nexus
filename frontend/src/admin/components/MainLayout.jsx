// ══════════════════════════════════════════════
//  ADMIN — MainLayout.jsx  (Redefined)
// ══════════════════════════════════════════════

import React from "react";
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

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block w-72 flex-shrink-0 relative z-50">
         <Sidebar active={page} onNavigate={onNavigate} onLogout={onLogout} />
      </div>
      
      {/* Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header title={title} />
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