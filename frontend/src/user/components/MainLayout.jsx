// ══════════════════════════════════════════════
//  USER — MainLayout.jsx  (Redefined)
// ══════════════════════════════════════════════

import React from "react";
import Sidebar from "./Sidebar";
import Header  from "./Header";
import FloatingChatbot from "../../shared/components/FloatingChatbot";

const PAGE_TITLES = {
  "dashboard":      "Dashboard",
  "knowledge":      "Knowledge Base",
  "qa":             "Q&A Forum",
  "reports":        "My Reports",
  "meetings":       "AI Assistant",
  "announcements":  "Announcements",
  "analytics":      "Analytics",
  "profile":        "My Profile",
  "settings":       "Settings",
};

const MainLayout = ({ page, onNavigate, onLogout, children }) => {
  const title = PAGE_TITLES[page] ?? "Dashboard";

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
         <Sidebar active={page} onNavigate={onNavigate} onLogout={onLogout} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 lg:p-10 select-none">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
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