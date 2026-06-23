import { useState, useEffect } from "react";
import { Search, BookOpen, Eye, ThumbsUp, CheckCircle, Plus, Trash2, ShieldCheck, X, Database } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const CATEGORIES = ["All", "Onboarding", "Reports", "Technical", "Templates", "Meetings"];

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Onboarding" });
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const res = await api.get('/articles');
      if (res.data?.success) setArticles(res.data.data);
    } catch (err) {
      console.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const toggleVerify = async (id) => {
    try {
      const res = await api.patch(`/articles/${id}/verify`);
      if (res.data?.success) {
        setArticles(articles.map(a => a.id === id ? res.data.data : a));
      }
    } catch (err) {
      alert("Verification update failed");
    }
  };

  const deleteArticle = async (id) => {
    if (window.confirm("Purge this asset from the repository?")) {
      try {
        await api.delete(`/articles/${id}`);
        setArticles(articles.filter(a => a.id !== id));
      } catch (err) {
        alert("Deletion failed");
      }
    }
  };

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    try {
      const res = await api.post('/articles', form);
      if (res.data?.success) {
        setArticles([res.data.data, ...articles]);
        setForm({ title: "", category: "Onboarding" });
        setShowForm(false);
      }
    } catch (err) {
      alert("Asset creation failed");
    }
  };

  const filtered = articles.filter(a =>
    (category === "All" || a.category === category) &&
    (a.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <SectionHeader
        title="Knowledge Grid"
        subtitle="Operational oversight of the institutional intelligence repository"
        action={
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-orange-500/20"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
            <Plus size={16} strokeWidth={3} /> Register New Asset
          </button>
        }
      />

      {showForm && (
        <Card className="p-6 sm:p-10 relative border-orange-500/20 bg-white dark:bg-[#020617] animate-in slide-in-from-top-6 duration-500">
           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">Initialize Resource Deployment</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
           </div>
           
           <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Asset Heading</label>
                 <input
                   value={form.title}
                   onChange={e => setForm({ ...form, title: e.target.value })}
                   placeholder="Enter descriptive title for this knowledge asset…"
                   className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm text-slate-900 dark:text-white shadow-inner focus:border-orange-500 transition-all"
                 />
              </div>
              <div className="w-full lg:w-72">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Sector Class</label>
                 <select
                   value={form.category}
                   onChange={e => setForm({ ...form, category: e.target.value })}
                   className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm text-slate-900 dark:text-white appearance-none cursor-pointer focus:border-orange-500 transition-all"
                 >
                   {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
              <div className="flex items-end">
                 <button
                   onClick={handleAdd}
                   className="w-full lg:w-48 py-4 rounded-2xl bg-white dark:bg-slate-800 text-orange-500 font-black text-[10px] uppercase tracking-widest border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95"
                 >
                   Confirm Record
                 </button>
              </div>
           </div>
        </Card>
      )}

      <div className="flex flex-col xl:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 transition-transform group-focus-within:scale-110" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Intelligence Database…"
            className="w-full pl-16 pr-8 py-4 rounded-[2rem] bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/5 outline-none font-bold text-sm text-slate-900 dark:text-white shadow-xl dark:shadow-2xl focus:border-orange-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap p-2 bg-white dark:bg-[#020617] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === c ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden p-0 border border-slate-100 dark:border-0 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] bg-white dark:bg-[#020617]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-white border-b border-slate-100 dark:border-white/5">
              <tr className="text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                <th className="px-8 py-6">Intelligence Asset</th>
                <th className="px-8 py-6">Author Node</th>
                <th className="px-8 py-6 text-center">Security Status</th>
                <th className="px-8 py-6 text-center">Override Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="p-3.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/5 border border-orange-500/20 dark:border-orange-500/10 text-orange-600 dark:text-orange-500 group-hover:scale-110 transition-transform">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-base tracking-tight mb-1">{a.title}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{a.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-transparent flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-white">
                          {a.author?.name?.charAt(0) || "U"}
                       </div>
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-400">{a.author?.name || "System"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <Badge variant={a.verified ? "success" : "warning"}>{a.verified ? "CERTIFIED" : "AUDIT PENDING"}</Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => toggleVerify(a.id)} 
                        className={`p-3 rounded-xl transition-all active:scale-90 border ${a.verified ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}
                        title={a.verified ? "Revoke Certification" : "Certify Asset"}
                      >
                        <ShieldCheck size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => deleteArticle(a.id)} 
                        className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl transition-all active:scale-90"
                        title="Purge Record"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-24 text-center">
                      <Database size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-800" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-700 italic">No assets detected in sector.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default KnowledgeBase;