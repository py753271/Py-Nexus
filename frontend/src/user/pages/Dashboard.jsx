import React, { useState, useEffect } from "react";
import { CheckCircle, ClipboardList, CalendarCheck, TrendingUp, Star, Zap, MapPin, Clock, RefreshCw } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, StatCard, Badge } from "../../shared/components/UI";
import { useUser } from "../../context/UserContext";
import api from "../../utils/api";

const Dashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({ enrollments: [], total: 0, completed: 0, reports: 0 });
  const [attendance, setAttendance] = useState(null); // today's attendance log
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [eRes, rRes, aRes] = await Promise.all([
        api.get('/enrollments/me'),
        api.get('/reports'),
        api.get('/attendance/my-stats').catch(() => ({ data: { success: false, data: { logs: [] } } }))
      ]);
      
      const enrollments = eRes.data?.success ? eRes.data.data : [];
      const reports = rRes.data?.success ? rRes.data.data : [];
      const attendanceLogs = aRes.data?.success && aRes.data.data?.logs ? aRes.data.data.logs : [];
      
      // Determine today's log
      const todayStr = new Date().toDateString();
      const todayLog = Array.isArray(attendanceLogs) 
        ? attendanceLogs.find(log => new Date(log.date).toDateString() === todayStr) 
        : null;
      
      setAttendance(todayLog);
      
      // Filter out enrollments with missing course data to prevent crashes
      const validEnrollments = Array.isArray(enrollments) ? enrollments.filter(e => e && e.course) : [];
      const completed = validEnrollments.filter(e => parseFloat(e.progress) >= 100).length;
      
      setStats({ 
        enrollments: validEnrollments, 
        total: validEnrollments.length, 
        completed,
        reports: Array.isArray(reports) ? reports.length : 0 
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = () => {
    setAttendanceLoading(true);
    setGeoError(null);
    
    if (!navigator.geolocation) {
      setGeoError("Geolocation telemetry is not supported by your browser.");
      setAttendanceLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationStr = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
          const res = await api.post('/attendance/checkin', { location: locationStr });
          if (res.data?.success) {
            setAttendance(res.data.data);
            alert("Check-in logged successfully!");
          }
        } catch (err) {
          alert(err.response?.data?.message || "Check-in failed");
        } finally {
          setAttendanceLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation capture error:", error);
        setGeoError("Location access denied. Please grant geolocation permissions to log check-in.");
        setAttendanceLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckOut = async () => {
    setAttendanceLoading(true);
    try {
      const res = await api.post('/attendance/checkout');
      if (res.data?.success) {
        setAttendance(res.data.data);
        alert("Check-out logged successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute real chart data safely
  const skillData = stats.enrollments.slice(0, 4).map(e => ({
    name: e.course?.title ? e.course.title.split(' ')[0] : "Unnamed",
    value: parseFloat(e.progress) || 10
  }));

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
         <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Skills Network
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Hey, <span className="text-emerald-500">{user?.name?.split(' ')[0] || "there"}!</span> Ready to innovate?
                </h1>
                <p className="mt-4 font-medium text-lg opacity-70">
                  You are currently driving <span className="text-emerald-600 font-bold">{stats.total}</span> active projects.
                </p>
              </div>
            </div>
         </div>
      </div>

      {/* Attendance Ledger Check-In Widget */}
      <Card className="p-6 overflow-hidden relative" style={{ background: 'var(--card)' }}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-500">
              <MapPin size={18} />
              <h4 className="text-sm font-black uppercase tracking-widest mt-0.5">Daily Attendance Telemetry</h4>
            </div>
            <p className="text-xs font-semibold opacity-60">
              {attendance 
                ? (attendance.checkOut 
                    ? "Your telemetry cycle for today is completed." 
                    : `Checked in at ${new Date(attendance.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - Status: ${attendance.status}`)
                : "Awaiting your daily attendance coordinates transmission."
              }
            </p>
            {attendance && attendance.location && (
              <p className="text-[10px] font-bold opacity-45 flex items-center gap-1">
                <MapPin size={10} /> Saved Coordinates: {attendance.location}
              </p>
            )}
            {geoError && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                ⚠️ {geoError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!attendance ? (
              <button
                disabled={attendanceLoading}
                onClick={handleCheckIn}
                className="px-5 py-3 rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
              >
                {attendanceLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <MapPin size={14} />
                )}
                Transmit Check-In
              </button>
            ) : !attendance.checkOut ? (
              <button
                disabled={attendanceLoading}
                onClick={handleCheckOut}
                className="px-5 py-3 rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
              >
                {attendanceLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Clock size={14} />
                )}
                Transmit Check-Out
              </button>
            ) : (
              <div className="px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 w-full sm:w-auto justify-center">
                <CheckCircle size={14} />
                Duty Complete
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Modules" value={stats.total} icon={ClipboardList} color="#10b981" />
        <StatCard title="Certifications" value={stats.completed} icon={CheckCircle} color="#00bea3" />
        <StatCard title="Reports Filed" value={stats.reports} icon={CalendarCheck} color="#3b82f6" />
        <StatCard title="Skill Rank" value={`LV ${1 + Math.floor(stats.reports / 2)}`} icon={TrendingUp} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 h-[400px] flex flex-col">
           <h3 className="text-xl font-black tracking-tight mb-8">Intelligence Flow</h3>
           <div className="flex-1 w-full relative min-h-[200px]">
             {stats.enrollments.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats.enrollments}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis hide />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                   <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                   <Area type="monotone" dataKey="progress" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                 <Zap size={32} className="mb-2" />
                 <p className="text-xs font-bold uppercase tracking-widest text-center">No Activity Detected<br/>Enroll in a module to generate flow data</p>
               </div>
             )}
           </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-black tracking-tight mb-8">Skill Blueprint</h3>
          <div className="h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={skillData.length ? skillData : [{name: 'Empty', value: 100}]} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                    {skillData.map((_, i) => <Cell key={i} fill={["#10b981", "#059669", "#3b82f6", "#8b5cf6"][i % 4]} cornerRadius={4} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-8">
             {skillData.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: ["#10b981", "#059669", "#3b82f6", "#8b5cf6"][i % 4] }} />
                    <span className="text-xs font-bold opacity-50">{s.name}</span>
                  </div>
                  <span className="text-xs font-black">{s.value}%</span>
                </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;