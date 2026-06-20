import { useState, useEffect } from "react";
import { Search, Upload, FileText, Download, TrendingUp, X } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newReport, setNewReport] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports?filter=own');
      if (res.data.success) setReports(res.data.data);
    } catch (err) {
      console.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async () => {
    if (!newReport.title.trim()) return;
    try {
      const res = await api.post('/reports', newReport);
      if (res.data.success) {
        setReports([res.data.data, ...reports]);
        setNewReport({ title: "", content: "" });
        setShowForm(false);
      }
    } catch (err) {
      alert("Submission failed");
    }
  };

  const filtered = reports.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <SectionHeader
        title="Intelligence Reports"
        subtitle="Operational ledger of progress and performance certifications"
        action={
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
            <Upload size={16} strokeWidth={3} /> Upload Submission
          </button>
        }
      />

      {showForm && (
        <Card className="p-6 relative border-[#f97316]">
          <div className="flex justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-orange-500">Initialize Submission</h3>
            <button onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <input
              value={newReport.title}
              onChange={e => setNewReport({ ...newReport, title: e.target.value })}
              placeholder="Report Title (e.g., Week 1 Progress)..."
              className="w-full px-5 py-4 text-sm rounded-2xl outline-none font-bold bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            />
            <textarea
              value={newReport.content}
              onChange={e => setNewReport({ ...newReport, content: e.target.value })}
              placeholder="Submission description or resource URL..."
              rows={3}
              className="w-full px-5 py-4 text-sm rounded-2xl outline-none font-medium bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 resize-none"
            />
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest"
              style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
            >
              Confirm Transmission
            </button>
          </div>
        </Card>
      )}

      <div className="relative group max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter submission history…"
          className="w-full pl-12 pr-6 py-3 rounded-xl outline-none text-sm font-bold shadow-sm bg-slate-50 dark:bg-slate-900"
        />
      </div>

      <div className="space-y-4">
        {filtered.map(report => (
          <Card key={report.id} hover className="p-6 group relative">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800">
                <FileText size={22} className="text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black tracking-tight mb-1">{report.title}</h3>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-40">
                   <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant={report.status === "Reviewed" ? "success" : "warning"}>
                  {report.status.toUpperCase()}
                </Badge>
                {report.score && (
                  <div className="flex flex-col items-end">
                     <p className="text-[8px] font-black uppercase tracking-widest mb-0.5 opacity-60">Efficiency Score</p>
                     <span className="text-base font-black flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500" /> {report.score}<span className="text-[10px] font-bold opacity-30">/10</span>
                     </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl opacity-20">
            <FileText size={60} className="mx-auto mb-6" />
            <p className="text-xl font-black uppercase tracking-[0.3em]">Operational Void</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;