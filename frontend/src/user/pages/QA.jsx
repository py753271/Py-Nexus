import { useState, useEffect } from "react";
import { ThumbsUp, MessageCircle, Search, Plus, MessageSquare } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const CATEGORIES = ["All", "Projects", "Reports", "Meetings", "Knowledge Base", "Internship"];

const QA = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchThreads = async () => {
    try {
      const res = await api.get('/forum');
      if (res.data.success) setQuestions(res.data.data);
    } catch (err) {
      console.error("Failed to load forum threads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleAdd = async () => {
    if (!newQuestion.trim()) return;
    try {
      const res = await api.post('/forum', {
        title: newQuestion,
        category: selectedCategory === "All" ? "Internship" : selectedCategory
      });
      if (res.data.success) {
        setQuestions([res.data.data, ...questions]);
        setNewQuestion("");
      }
    } catch (err) {
      alert("Broadcast failed. Ensure you are logged in.");
    }
  };

  const handleUpvote = async (id) => {
    try {
      const res = await api.patch(`/forum/${id}/upvote`);
      if (res.data.success) {
        setQuestions(qs => qs.map(q => q.id === id ? res.data.data : q));
      }
    } catch (err) {
      console.error("Upvote failed");
    }
  };

  const filtered = questions.filter(q =>
    (selectedCategory === "All" || q.category === selectedCategory) &&
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <SectionHeader
        title="Intelligence Forum"
        subtitle="Peer-to-peer knowledge exchange and community support"
        action={
          <Badge variant="default">{questions.length} ACTIVE THREAD{questions.length !== 1 ? "S" : ""}</Badge>
        }
      />

      <Card className="p-6 relative overflow-hidden" 
        style={{ background: 'var(--background)', border: '1px solid #f97316' }}>
        <h3 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: '#f97316' }}>Initiate New Thread</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Ask anything about the platform, projects or requirements…"
            className="flex-1 px-5 py-4 text-base rounded-2xl outline-none font-medium placeholder:opacity-40 transition-all focus:ring-2 focus:ring-orange-500/20 shadow-inner shadow-black/5 bg-slate-50 dark:bg-slate-900"
          />
          <button
            onClick={handleAdd}
            className="px-8 py-4 rounded-2xl text-white text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
          >
            <Plus size={18} strokeWidth={3} /> Broadcast
          </button>
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative w-full max-w-md group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 group-focus-within:scale-110 transition-transform" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search discussions…"
            className="w-full pl-12 pr-6 py-3 rounded-xl outline-none text-sm font-bold shadow-sm bg-slate-50 dark:bg-slate-900"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm`}
              style={{
                background: selectedCategory === c ? '#f97316' : 'var(--card)',
                color: selectedCategory === c ? '#fff' : 'var(--muted)',
                border: selectedCategory === c ? '1px solid #f97316' : '1px solid var(--border)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(q => (
          <Card key={q.id} hover className="p-6 group transition-all">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleUpvote(q.id)}
                  className="p-3 rounded-2xl transition-all active:scale-75 shadow-lg shadow-black/5 bg-slate-50 dark:bg-slate-800"
                >
                  <ThumbsUp size={18} strokeWidth={2.5} className="text-orange-500" />
                </button>
                <span className="text-sm font-black">{q.votes}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black tracking-tight leading-snug mb-3 group-hover:text-orange-500 cursor-pointer transition-colors">
                  {q.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] opacity-60">
                  <Badge variant="gray">{q.category}</Badge>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {q.author?.name}</span>
                  <span className="opacity-40">{new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24 opacity-30">
            <MessageSquare size={60} className="mx-auto mb-6" />
            <p className="text-xl font-black uppercase tracking-[0.3em]">Board Cleared</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QA;