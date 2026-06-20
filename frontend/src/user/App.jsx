// ══════════════════════════════════════════════
//  USER — App.jsx
// ══════════════════════════════════════════════

import { useState } from "react";
import MainLayout    from "./components/MainLayout";
import Dashboard     from "./pages/Dashboard";
import KnowledgeBase from "./pages/KnowledgeBase";
import QA            from "./pages/QA";
import Reports       from "./pages/Reports";
import Tasks         from "./pages/Tasks";
import Meetings      from "./pages/Meetings";
import Announcements from "./pages/Announcements";
import Analytics     from "./pages/Analytics";
import Profile       from "./pages/Profile";
import Settings      from "./pages/Settings";

const PAGES = {
  dashboard:     <Dashboard />,
  knowledge:     <KnowledgeBase />,
  qa:            <QA />,
  reports:       <Reports />,
  tasks:         <Tasks />,
  meetings:      <Meetings />,
  announcements: <Announcements />,
  analytics:     <Analytics />,
  profile:       <Profile />,
  settings:      <Settings />,
};

const UserApp = ({ onLogout }) => {
  const [page, setPage] = useState("dashboard");

  return (
    <MainLayout page={page} onNavigate={setPage} onLogout={onLogout}>
      {PAGES[page]}
    </MainLayout>
  );
};

export default UserApp;