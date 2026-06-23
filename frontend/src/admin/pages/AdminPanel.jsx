import { useState, useEffect } from "react";
import { 
  Search, Plus, Trash2, ShieldCheck, Users, 
  XCircle, Power, User, Mail, Briefcase, 
  Shield, Check, ArrowRight, ArrowLeft, X, Loader2
} from "lucide-react";
import { Card, Badge, Avatar, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const ROLE_VARIANT   = { ADMIN: "purple", STUDENT: "default", INSTRUCTOR: "orange" };
const STATUS_VARIANT = { Active: "success", Inactive: "warning", Terminated: "danger" };

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/users', form);
      if (res.data?.success) {
        setUsers(prev => [...prev, res.data.data]);
        setShowModal(false);
        setForm({ name: "", email: "", password: "", role: "STUDENT" });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Purge this asset from the database?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        alert("Deletion failed");
      }
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      <SectionHeader
        title="Institutional Hub"
        subtitle="Global operational oversight and asset management system"
        action={
          <button 
            onClick={() => setShowModal(true)}
            className="px-8 py-3.5 rounded-2xl text-white text-sm font-black uppercase tracking-widest bg-orange-500 shadow-xl shadow-orange-500/20 flex items-center gap-3 transition-all active:scale-95">
            <Plus size={20} strokeWidth={3} /> Onboard Asset
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Onboarded",  value: users.length, color: "#f97316" },
          { label: "Admins",     value: users.filter(u => u.role === "ADMIN").length, color: "#8b5cf6" },
          { label: "Students",    value: users.filter(u => u.role === "STUDENT").length, color: "#3b82f6" },
          { label: "Instructors", value: users.filter(u => u.role === "INSTRUCTOR").length, color: "#10b981" },
        ].map(s => (
          <Card key={s.label} className="p-6 relative group">
            <p className="text-3xl font-black">{s.value}</p>
            <div className="text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} /> {s.label}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets by identity or credential..."
            className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm"
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-0 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                {["Identity", "Access", "Sector", "Status", "Command"].map(h => (
                  <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-60 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(u => (
                <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar initials={u.name[0]} size="md" />
                      <div>
                        <p className="font-black tracking-tight">{u.name}</p>
                        <p className="text-[10px] font-bold uppercase opacity-50">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black uppercase">Institutional</span>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td className="px-6 py-5">
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Onboarding Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative overflow-hidden" style={{ background: 'var(--card)' }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-300" />
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Asset Onboarding</h3>
                 <button onClick={() => setShowModal(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                    <X size={24} />
                 </button>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Identity Name</label>
                    <input 
                      required
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border transition-all focus:border-orange-500"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Access Credential (Email)</label>
                    <input 
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="email@example.com"
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border transition-all focus:border-orange-500"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Security Key (Password)</label>
                    <input 
                      required
                      type="password"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border transition-all focus:border-orange-500"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Authorization Role</label>
                    <select
                      value={form.role}
                      onChange={e => setForm({...form, role: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border transition-all focus:border-orange-500 bg-transparent"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                      <option value="STUDENT" style={{ background: 'var(--card)' }}>STUDENT (Intern)</option>
                      <option value="INSTRUCTOR" style={{ background: 'var(--card)' }}>INSTRUCTOR</option>
                      <option value="ADMIN" style={{ background: 'var(--card)' }}>ADMIN</option>
                    </select>
                 </div>
                 
                 <button 
                    disabled={submitting}
                    className="w-full py-4 mt-4 rounded-2xl text-white dark:text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                    {submitting ? <Loader2 className="animate-spin text-white" size={20} /> : "Finalize Onboarding"}
                  </button>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;