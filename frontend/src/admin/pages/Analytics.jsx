// ══════════════════════════════════════════════
//  ADMIN — pages/Analytics.jsx
// ══════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { 
  Users, FileText, Zap, 
  Target, Award, Loader2, AlertCircle 
} from "lucide-react";
import { Card, StatCard, SectionHeader, Badge } from "../../shared/components/UI";
import api from "../../utils/api";

const COLORS = ["#f97316", "#00bea3", "#3b82f6", "#8b5cf6", "#f59e0b"];

const Analytics = () => {
  const [data, setData] = useState({
    avgScore: "0/10",
    studentCount: 0,
    enrollmentCount: 0,
    categoryStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/global');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch global analytics:", err);
      setError("Intelligence feed disconnected.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 opacity-40">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="font-black uppercase tracking-widest text-sm text-slate-400 dark:text-white">Synthesizing Intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-20 text-center opacity-40">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-sm text-slate-900 dark:text-white">{error}</p>
        <button onClick={fetchAnalytics} className="mt-4 text-xs font-bold underline text-slate-900 dark:text-white">Reconnect</button>
      </Card>
    );
  }

  const categoryData = Array.isArray(data?.categoryStats) ? data.categoryStats : [];

  const statsCards = [
    { title: "Net Quality", value: data?.avgScore || "0/10", icon: Target, color: "#f97316" },
    { title: "Active Interns", value: data?.studentCount || 0, icon: Users, color: "#00bea3" },
    { title: "Enrollments", value: data?.enrollmentCount || 0, icon: Zap, color: "#3b82f6" },
    { title: "Reports Filed", value: "Real-time", icon: FileText, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader
        title="Intelligence Command"
        subtitle="Unified visualization of institutional performance and asset utilization"
      />

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map(c => (
           <StatCard key={c.title} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Bar Chart (Category Distribution) */}
        <Card className="lg:col-span-2 p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black tracking-tight mb-1" style={{ color: 'var(--foreground)' }}>Sector Distribution</h3>
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Asset allocation across knowledge verticals</p>
            </div>
            <Badge variant="purple">LIVE TELEMETRY</Badge>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: "var(--muted)" }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: "var(--muted)" }} 
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(249,115,22,0.03)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', background: 'var(--card)', color: 'var(--foreground)' }}
                  itemStyle={{ fontWeight: 900, fontSize: 12 }}
                />
                <Bar dataKey="count" name="Courses" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Resource Deployment Pie Chart */}
        <Card className="p-8 flex flex-col justify-between overflow-hidden relative">
          <div>
            <h3 className="text-xl font-black tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>Module Engagement</h3>
            <p className="text-sm font-medium mb-8" style={{ color: 'var(--muted)' }}>Distribution of knowledge assets</p>
          </div>
          
          <div className="h-[260px] relative mt-4">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
               <span className="text-4xl font-black" style={{ color: 'var(--foreground)' }}>100%</span>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Institutional</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData.length ? categoryData : [{name: 'Empty', count: 1}]} innerRadius={85} outerRadius={110} paddingAngle={8} dataKey="count" stroke="none">
                  {categoryData.length > 0 ? categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                  )) : <Cell fill="#334155" />}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 mt-8 pb-2">
            {categoryData.slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125" style={{ background: COLORS[i % COLORS.length] }} />
                   <span className="text-xs font-black uppercase tracking-tight" style={{ color: 'var(--muted)' }}>{d.name}</span>
                </div>
                <span className="text-xs font-black" style={{ color: 'var(--foreground)' }}>{d.count} Courses</span>
              </div>
            ))}
            {categoryData.length === 0 && (
              <p className="text-xs italic opacity-40 text-center py-4">No sector data synchronized.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;