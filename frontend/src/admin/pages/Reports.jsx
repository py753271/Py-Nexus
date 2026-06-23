import { useState, useEffect } from "react";
import { Search, FileText, Download, CheckCircle, Clock, Star, TrendingUp, X } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const FILTERS = ["All", "Pending", "Reviewed"];

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [scoringReport, setScoringReport] = useState(null);
  const [score, setScore] = useState(8.0);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      if (res.data?.success) setReports(res.data.data);
    } catch (err) {
      console.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleScore = async () => {
    if (!scoringReport) return;
    try {
      const res = await api.patch(`/reports/${scoringReport.id}/score`, { score, status: "Reviewed" });
      if (res.data?.success) {
        setReports(reports.map(r => r.id === scoringReport.id ? { ...r, score, status: "Reviewed" } : r));
        setScoringReport(null);
      }
    } catch (err) {
      alert("Scoring failed");
    }
  };

  const filtered = reports.filter(r =>
    (filter === "All" || r.status === filter) &&
    ((r.title || "").toLowerCase().includes(search.toLowerCase()) ||
     (r.user?.name || "").toLowerCase().includes(search.toLowerCase()))
  );

  const pendingCount = reports.filter(r => r.status === "Pending").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <SectionHeader title="Operational Audit" subtitle="Verification and certification of asset performance reports" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 sm:p-8 border-l-4 border-l-orange-500 bg-white dark:bg-[#020617] border-slate-100 dark:border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-5 group-hover:scale-110 transition-transform">
              <FileText size={60} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Total Queue</p>
           <h4 className="text-4xl font-black text-slate-900 dark:text-white">{reports.length}</h4>
        </Card>
        <Card className="p-6 sm:p-8 border-l-4 border-l-purple-500 bg-white dark:bg-[#020617] border-slate-100 dark:border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Clock size={60} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Awaiting Certification</p>
           <h4 className="text-4xl font-black text-purple-600 dark:text-purple-500">{pendingCount}</h4>
        </Card>
      </div>

      {/* Scoring Controller */}
      {scoringReport && (
        <Card className="p-6 sm:p-10 border-orange-500/20 bg-orange-500/5 animate-in slide-in-from-top-6 duration-500 relative overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-purple-500" />
           <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-orange-500 mb-1">Audit Protocol: {scoringReport.title}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ID: {String(scoringReport.id).slice(-8)} / Subject: {scoringReport.user?.name}</p>
              </div>
              <button onClick={() => setScoringReport(null)} className="p-2 hover:bg-orange-500/10 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
           </div>
           
           <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 w-full">
                 <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quality Performance Index</label>
                    <span className="text-[10px] font-black text-orange-500">ACCURACY: HIGH</span>
                 </div>
                 <input 
                   type="range" min="1" max="10" step="0.5" 
                   value={score} onChange={e => setScore(e.target.value)} 
                   className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500"
                 />
                 <div className="flex justify-between text-[10px] font-black mt-3 text-slate-500">
                   <span>1.0 (LOW)</span>
                   <span>10.0 (OPTIMAL)</span>
                 </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 w-full lg:w-auto">
                <div className="text-center px-10 border-x border-slate-200 dark:border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Score</p>
                   <p className="text-5xl font-black text-slate-900 dark:text-white">{score}</p>
                </div>
                <button 
                  onClick={handleScore}
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-orange-500/30 active:scale-95 transition-all text-center"
                >
                  Finalize Audit
                </button>
              </div>
           </div>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white dark:bg-[#020617] p-4 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl">
        <div className="relative w-full max-w-xl group">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 transition-transform group-focus-within:scale-110" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Scan repository for report identity or subject…"
            className="w-full pl-16 pr-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm shadow-inner"
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 p-2 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 justify-center">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} 
              className={`px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-4">
        {filtered.map(report => (
          <Card key={report.id} hover className="p-6 sm:p-8 group relative bg-white dark:bg-[#020617] border-slate-100 dark:border-white/5 overflow-hidden transition-all hover:border-orange-500/30">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
               <TrendingUp size={40} className="text-orange-500" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-6 sm:gap-8">
              <div className="p-5 rounded-3xl bg-orange-500/10 dark:bg-orange-500/5 border border-orange-500/20 dark:border-orange-500/10 text-orange-600 dark:text-orange-500 group-hover:scale-110 transition-transform w-fit">
                <FileText size={28} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-orange-500 transition-colors">{report.title}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5">SUBJECT: <span className="text-slate-900 dark:text-white">{report.user?.name}</span></span>
                  <span className="opacity-20">/</span>
                  <span>SYNCED: {new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 w-full md:w-auto md:justify-end">
                <Badge variant={report.status === "Reviewed" ? "success" : "warning"}>{report.status.toUpperCase()}</Badge>
                
                {report.status === "Reviewed" ? (
                  <div className="flex flex-col items-end px-6 border-l border-slate-200 dark:border-white/5">
                     <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Quality Index</p>
                     <span className="text-lg font-black text-orange-600 dark:text-orange-500 flex items-center gap-2"><Star size={14} fill="currentColor" /> {report.score}</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setScoringReport(report)}
                    className="px-4 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 transition-all text-center"
                  >
                    Initiate Audit
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-32 opacity-20 bg-slate-100 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
             <FileText size={80} className="mx-auto mb-6 opacity-40 text-slate-900 dark:text-white" />
             <p className="font-black uppercase tracking-[0.3em] text-sm italic text-slate-900 dark:text-white">Repository Synchronized: Null</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;