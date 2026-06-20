import { useState, useEffect } from "react";
import { Edit, Save, User, Mail, Briefcase, GraduationCap, Link, Zap } from "lucide-react";
import { Card, SectionHeader } from "../../shared/components/UI";
import { useUser } from "../../context/UserContext";

const FIELDS = [
  { label: "Full Name",     key: "name",       type: "text",  icon: User          },
  { label: "Email",         key: "email",      type: "email", icon: Mail          },
  { label: "Role",          key: "role",       type: "text",  icon: Briefcase     },
  { label: "Department",    key: "department", type: "text",  icon: null          },
  { label: "College",       key: "college",    type: "text",  icon: GraduationCap },
  { label: "Year of Study", key: "year",       type: "text",  icon: null          },
  { label: "Date of Birth", key: "dob",        type: "date",  icon: null          },
  { label: "LinkedIn",      key: "linkedin",   type: "url",   icon: Link          },
];

const AdminProfile = () => {
  const { user, updateUserProfile } = useUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name:       "",
    email:      "",
    role:       "",
    department: "",
    college:    "",
    dob:        "",
    year:       "",
    linkedin:   "",
    skills:     "React, Node.js, SQL",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name:       user.name || "",
        email:      user.email || "",
        role:       user.role || "ADMIN",
        department: user.department || "",
        college:    user.college || "",
        dob:        user.dob || "",
        year:       user.year || "",
        linkedin:   user.linkedin || "",
        skills:     user.skills || "React, Node.js, SQL",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserProfile(profile);
      setEditing(false);
    } catch (err) {
      alert("Failed to update profile. Technical error encountered.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  const getInitials = (name) => {
    return name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "UN";
  };

  // Force Admin Dark Theme Component Level Variables
  const THEME = {
    bg: "#020617",
    cardBg: "#0f172a",
    border: "rgba(255,255,255,0.05)",
    text: "#ffffff",
    muted: "#94a3b8",
  };

  return (
    <div className="max-w-3xl space-y-6 pb-12 animate-in fade-in duration-700">
      <SectionHeader title="Admin Profile" subtitle="Manage your access identity and system credentials" />

      <Card className="overflow-hidden border-white/5 shadow-2xl" style={{ background: THEME.cardBg }}>
        <div
          className="h-32 w-full relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)" }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 rounded-full opacity-20 pointer-events-none blur-3xl"
            style={{ background: "#f97316" }}
          />
          <div className="absolute top-4 right-6 opacity-20 pointer-events-none">
            <Zap size={100} strokeWidth={0.5} className="text-orange-500 rotate-12" />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: "linear-gradient(90deg, #f97316, transparent)" }}
          />
        </div>

        <div className="px-8 pb-8">
          <div className="flex items-end gap-5 -mt-12 mb-8">
            <div
              className="w-24 h-24 rounded-2xl border-4 flex items-center justify-center text-3xl font-black text-white shadow-xl flex-shrink-0 relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #020617, #0f172a)",
                borderColor: "#f97316",
                boxShadow: "0 8px 32px rgba(249, 115, 22, 0.2)",
              }}
            >
              <span className="relative z-10">{getInitials(profile.name)}</span>
              <div className="absolute inset-0 bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors" />
            </div>
            
            <div className="pb-1 flex-1">
              <h2 className="text-xl font-black text-white tracking-tight">
                {profile.name || "Loading..."}
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest mt-1 text-orange-500">
                {profile.role} · {profile.department}
              </p>
            </div>
            
            <div className="pb-1">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95 border border-white/10 text-white"
                >
                  <Edit size={14} /> System Override
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  <Save size={14} /> {saving ? "Writing DB..." : "Commit Changes"}
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FIELDS.map(({ label, key, type, icon: Icon }) => (
              <div key={key}>
                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-slate-500">
                  {label}
                </label>
                <div className="relative group">
                  {Icon && (
                    <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  )}
                  <input
                    type={type}
                    name={key}
                    value={profile[key]}
                    disabled={!editing || key === 'email' || key === 'role'}
                    onChange={handleChange}
                    className={`w-full py-3.5 text-sm rounded-xl outline-none transition-all font-bold ${
                      (!editing || key === 'email' || key === 'role') ? "opacity-60 bg-[#020617]/50" : "bg-[#020617] focus:border-orange-500"
                    } ${Icon ? "pl-10 pr-4" : "px-4"}`}
                    style={{
                      border: `1px solid ${THEME.border}`,
                      color: THEME.text,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminProfile;