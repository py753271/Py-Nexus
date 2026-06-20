import { useState, useEffect } from "react";
import { Plus, Pin, Trash2, Megaphone, X } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const PRIORITY_VARIANTS = { High: "danger", Medium: "warning", Low: "success" };
const PRIORITIES        = ["High", "Medium", "Low"];
const FILTERS           = ["All", "High", "Medium", "Low"];

const Announcements = () => {
  const [items,    setItems]   = useState([]);
  const [filter,   setFilter]  = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]    = useState({ title: "", desc: "", priority: "Medium" });
  const [loading,  setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await api.get('/announcements');
      if (res.data.success) setItems(res.data.data);
    } catch (err) {
      console.error("Failed to load broadcasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const togglePin = async (id) => {
    try {
      const res = await api.patch(`/announcements/${id}/pin`);
      if (res.data.success) {
        setItems(items.map(a => a.id === id ? res.data.data : a));
      }
    } catch (err) {
      alert("Pin toggle failed");
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm("Purge this broadcast from the grid?")) {
      try {
        await api.delete(`/announcements/${id}`);
        setItems(items.filter(a => a.id !== id));
      } catch (err) {
        alert("Deletion failed");
      }
    }
  };

  const handlePost = async () => {
    if (!form.title.trim() || !form.desc.trim()) return;
    try {
      const res = await api.post('/announcements', {
        title: form.title,
        description: form.desc,
        priority: form.priority
      });
      if (res.data.success) {
        setItems([res.data.data, ...items]);
        setForm({ title: "", desc: "", priority: "Medium" });
        setShowForm(false);
      }
    } catch (err) {
      alert("Broadcast failed");
    }
  };

  const filtered = items
    .filter(a => filter === "All" || a.priority === filter)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Broadcast Station"
        subtitle="Global platform-wide announcement and directive system"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
          >
            <Plus size={16} /> New Broadcast
          </button>
        }
      />

      {showForm && (
        <Card className="p-6 relative overflow-hidden animate-in slide-in-from-top-4 duration-300" 
          style={{ background: 'var(--background)', border: '1px solid #f97316' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-orange-500">Initialize Link</h3>
            <button onClick={() => setShowForm(false)} className="opacity-60 hover:opacity-100">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement Heading…"
              className="w-full px-5 py-4 text-sm rounded-2xl outline-none font-black bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            />
            <textarea
              value={form.desc}
              onChange={e => setForm({ ...form, desc: e.target.value })}
              placeholder="System Directive Status Details…"
              rows={3}
              className="w-full px-5 py-4 text-sm rounded-2xl outline-none font-bold bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 resize-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Priority:</span>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`}
                      style={{
                        background: form.priority === p ? '#f97316' : 'var(--card)',
                        color: form.priority === p ? '#fff' : 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handlePost}
                className="px-10 py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
              >
                Transmit Broadcast
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all`}
            style={{
              background: filter === f ? '#f97316' : 'var(--card)',
              color: filter === f ? '#fff' : 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(a => (
          <Card key={a.id} className="p-6 group relative" style={{ borderLeft: a.pinned ? '4px solid #f97316' : '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {a.pinned && <Badge variant="orange" className="bg-orange-50 text-orange-600 border-orange-100"><Pin size={10} className="mr-1" /> Pinned</Badge>}
                  <Badge variant={PRIORITY_VARIANTS[a.priority]}>{a.priority}</Badge>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">{a.title}</h3>
                <p className="text-sm font-medium opacity-60 leading-relaxed max-w-3xl">{a.description}</p>
                <p className="mt-4 text-[10px] font-black tracking-[0.2em] opacity-30 uppercase">
                  {new Date(a.createdAt).toLocaleDateString()} at {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => togglePin(a.id)} className={`p-3 rounded-2xl transition-all ${a.pinned ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-400'}`}>
                   <Pin size={18} />
                </button>
                <button onClick={() => deleteItem(a.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl transition-all">
                   <Trash2 size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Announcements;