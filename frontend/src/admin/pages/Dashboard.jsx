import React, { useState, useEffect } from "react";
import { Shield, AlertCircle, Star, CalendarCheck, HelpCircle, Loader2, Activity, Zap, Cpu } from "lucide-react";
import { Card, StatCard, Badge } from "../../shared/components/UI";
import api from "../../utils/api";

// ══════════════════════════════════════════════
//  STABILIZED ADMIN DASHBOARD
// ══════════════════════════════════════════════

const AdminDashboard = () => {
  const [data, setData] = useState({
    studentCount: 0,
    courseCount: 0,
    enrollmentCount: 0,
    avgScore: "0/10",
    eventStream: [],
    categoryStats: []
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [gRes, qRes] = await Promise.all([
        api.get('/analytics/global'),
        api.get('/forum')
      ]);
      
      if (gRes.data?.success) setData(gRes.data.data);
      if (qRes.data?.success) setQuestions(Array.isArray(qRes.data.data) ? qRes.data.data : []);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      setError("Inbound telemetry failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 opacity-40">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="font-black uppercase tracking-widest text-sm text-slate-400 dark:text-white">Initializing Uplink...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-20 text-center opacity-40">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-sm text-slate-900 dark:text-white">{error}</p>
        <button onClick={fetchData} className="mt-4 text-xs font-bold underline text-slate-900 dark:text-white">Retry Connection</button>
      </Card>
    );
  }

  const mainStats = [
    { value: data?.studentCount || 0, label: "Total Interns", icon: Activity, color: "#f97316" },
    { value: data?.enrollmentCount || 0, label: "Active Nodes", icon: Zap, color: "#3b82f6" },
    { value: data?.courseCount || 0, label: "Live Frameworks", icon: Shield, color: "#10b981" },
    { value: (questions || []).length, label: "Q&A Threads", icon: HelpCircle, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Visual Identity Hero */}
      <div className="p-10 rounded-[2rem] bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/5 relative overflow-hidden group shadow-sm dark:shadow-none">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
           <Shield size={120} strokeWidth={0.5} className="text-orange-500" />
        </div>
        <div className="relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Secure Admin Node</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Command Terminal</h1>
           <p className="text-slate-500 dark:text-slate-400 max-w-lg text-sm font-medium leading-relaxed">
             Real-time institutional oversight and framework management. All operations monitored and logged via central telemetry.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map(s => (
          <StatCard key={s.label} title={s.label} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-10 bg-white dark:bg-[#020617] border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Event Logs</h3>
              <Badge variant="gray">SYSTEM STATUS: OPTIMAL</Badge>
           </div>
           <div className="space-y-6">
              {(data?.eventStream || []).length > 0 ? data.eventStream.map((a, i) => (
                <div key={i} className="flex items-start gap-6 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    a.color === 'orange' ? 'bg-orange-500' : 
                    a.color === 'green' ? 'bg-emerald-400' : 
                    a.color === 'purple' ? 'bg-purple-500' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{a.action || "Log Item"}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{a.detail || "Data detail"}</p>
                  </div>
                  <span className="text-[8px] font-black text-slate-700">RECENT</span>
                </div>
              )) : (
                <div className="py-20 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.2em]">
                   Telemetry Feed Empty
                </div>
              )}
           </div>
        </Card>

        <Card className="p-10 bg-white dark:bg-[#020617] border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none">
           <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">System Metrics</h3>
           <div className="space-y-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Average Performance</p>
                 <p className="text-2xl font-black text-orange-500">{data?.avgScore || "0/10"}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authorization Role</p>
                 <p className="text-2xl font-black text-purple-500">SUPER_ADMIN</p>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;