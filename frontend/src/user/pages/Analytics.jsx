import React, { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FileText, Clock, BookOpen, MessageSquare, TrendingUp, Target, Rocket, Eye } from "lucide-react";
import { Card, StatCard, SectionHeader, Badge } from "../../shared/components/UI";
import api from "../../utils/api";

const PIE_COLORS = ["#f97316", "#00bea3", "#2563eb", "#7c3aed"];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
      <p className="text-[10px] uppercase tracking-widest mb-1 opacity-50">{label}</p>
      <p style={{ color: '#f97316' }}>{payload[0].name}: <span className="text-slate-900 dark:text-white">{payload[0].value}</span></p>
    </div>
  );
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics/personal?t=${Date.now()}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Ensure data structure exists to prevent crashes
  const safeData = data || {
    counters: { totalReports: 0, pendingReports: 0, totalViews: 0, forumPosts: 0 },
    weeklyReports: [],
    skillDistribution: [{ name: "Loading", value: 100 }],
    topArticles: [],
    taskProgress: []
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <SectionHeader
        title="My Analytics"
        subtitle="Track your reports, knowledge base activity and overall internship progress"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Reports Submitted" value={safeData.counters?.totalReports ?? 0} icon={FileText} color="#f97316" />
        <StatCard title="Pending Reviews" value={safeData.counters?.pendingReports ?? 0} icon={Clock} color="#7c3aed" />
        <StatCard title="Knowledge Access" value={safeData.counters?.totalViews ?? 0} icon={BookOpen} color="#00bea3" />
        <StatCard title="Q&A Posts" value={safeData.counters?.forumPosts ?? 0} icon={MessageSquare} color="#2563eb" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 min-h-[400px] flex flex-col">
          <h3 className="text-xl font-black mb-8">Weekly Performance</h3>
          {safeData.weeklyReports?.some(r => r.reports > 0) ? (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={safeData.weeklyReports}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="reports" name="Reports" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
               <FileText size={48} />
               <p className="font-black uppercase tracking-widest text-xs">Awaiting Report Submissions</p>
            </div>
          )}
        </Card>

        <Card className="p-8 min-h-[400px] flex flex-col">
          <h3 className="text-xl font-black mb-8">Skill Distribution</h3>
          {safeData.skillDistribution?.length > 0 && safeData.skillDistribution[0].name !== "Exploration" ? (
            <div className="flex-1 italic flex flex-col items-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={safeData.skillDistribution} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                       {safeData.skillDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} cornerRadius={6} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-8 w-full">
                 {safeData.skillDistribution.map((s, i) => (
                   <div key={s?.name || i} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{background: PIE_COLORS[i % PIE_COLORS.length]}} />
                       <span className="text-xs font-bold opacity-60">{s?.name || "Other"}</span>
                     </div>
                     <span className="text-xs font-black">{s?.value || 0}%</span>
                   </div>
                 ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
               <BookOpen size={48} />
               <p className="font-black uppercase tracking-widest text-xs">Enroll in Courses to Map Skills</p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Progress */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-8 text-orange-500">
            <Target size={20} />
            <h3 className="text-xl font-black mt-1">Operational Progress</h3>
          </div>
          <div className="space-y-6">
            {(safeData.taskProgress || []).length > 0 ? (
              safeData.taskProgress.map((tp, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2 font-black text-[10px] uppercase tracking-widest opacity-60">
                    <span>{tp?.task || "General Task"}</span>
                    <span>{tp?.pct || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{width: `${tp?.pct || 0}%`}} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center opacity-20 space-y-3">
                 <Rocket size={40} className="mx-auto" />
                 <p className="font-black uppercase tracking-widest text-[10px]">No active missions detected</p>
              </div>
            )}
          </div>
        </Card>

        {/* Top Articles */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-8 text-emerald-500">
            <TrendingUp size={20} />
            <h3 className="text-xl font-black mt-1">Trending Intelligence</h3>
          </div>
          <div className="space-y-4">
            {(safeData.topArticles || []).length > 0 ? (
              safeData.topArticles.map((a, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500 text-white dark:text-white font-black text-xs">#{i+1}</div>
                   <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{a?.title || "Operational Asset"}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase">{a?.category || "General"}</p>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs font-black opacity-60">
                      <Eye size={12} /> {a?.views || 0}
                   </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center opacity-20 space-y-3">
                 <BookOpen size={40} className="mx-auto" />
                 <p className="font-black uppercase tracking-widest text-[10px]">Archives Empty</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;