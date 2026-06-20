import { useState, useEffect } from "react";
import { Pin, Megaphone } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const PRIORITY_VARIANTS = { High: "danger", Medium: "warning", Low: "success" };
const FILTERS = ["All", "High", "Medium", "Low"];

const Announcements = () => {
  const [items,  setItems]  = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await api.get('/announcements');
      if (res.data.success) setItems(res.data.data);
    } catch (err) {
      console.error("Failed to fetch broadcasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const togglePin = id =>
    setItems(items.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));

  const filtered = items
    .filter(a => filter === "All" || a.priority === filter)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        title="Institutional Broadcasts"
        subtitle="Stay updated with platform directives and internship news"
        action={
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Live Feed Active</span>
          </div>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all`}
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
          <Card key={a.id} className="p-6 transition relative border border-slate-100 dark:border-slate-800"
            style={{ borderLeft: a.pinned ? '4px solid #f97316' : '' }}>
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {a.pinned && <Badge variant="orange" className="bg-orange-50 text-orange-600 border-orange-100"><Pin size={10} className="mr-1" /> Pinned</Badge>}
                  <Badge variant={PRIORITY_VARIANTS[a.priority]}>{a.priority}</Badge>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">{a.title}</h3>
                <p className="text-sm font-medium opacity-70 leading-relaxed max-w-4xl">{a.description}</p>
                <p className="mt-4 text-[10px] font-black tracking-widest opacity-30 uppercase">
                  Broadcast Received: {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => togglePin(a.id)}
                className={`p-3 rounded-2xl transition flex-shrink-0 ${a.pinned ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100'}`}
              >
                <Pin size={18} />
              </button>
            </div>
          </Card>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24 opacity-20">
            <Megaphone size={60} className="mx-auto mb-6" />
            <p className="text-xl font-black uppercase tracking-[0.3em]">No Broadcasts Logged</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;