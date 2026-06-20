// ══════════════════════════════════════════════
//  ADMIN — App.jsx
// ══════════════════════════════════════════════

import { useState } from "react";
import MainLayout    from "./components/MainLayout";
import Dashboard     from "./pages/Dashboard";
import AdminPanel    from "./pages/AdminPanel";
import Management    from "./pages/Management";
import Tasks         from "./pages/Tasks";
import KnowledgeBase from "./pages/KnowledgeBase";
import Reports       from "./pages/Reports";
import Analytics     from "./pages/Analytics";
import Announcements from "./pages/Announcements";
import Settings      from "./pages/Settings";
import Profile       from "./pages/Profile";

const PAGES = {
  "admin-dashboard":     <Dashboard />,
  "admin-users":         <AdminPanel />,
  "admin-management":    <Management />,
  "admin-tasks":         <Tasks />,
  "admin-knowledge":     <KnowledgeBase />,
  "admin-reports":       <Reports />,
  "admin-analytics":     <Analytics />,
  "admin-announcements": <Announcements />,
  "admin-settings":      <Settings />,
  "admin-profile":       <Profile />,
};

const AdminApp = ({ onLogout }) => {
  const [page, setPage] = useState("admin-dashboard");

  return (
    <MainLayout page={page} onNavigate={setPage} onLogout={onLogout}>
      {PAGES[page]}
    </MainLayout>
  );
};

export default AdminApp;