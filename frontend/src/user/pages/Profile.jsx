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

const Profile = () => {
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
        role:       user.role || "STUDENT",
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

  return (
    <div className="max-w-3xl space-y-6">
      <SectionHeader title="My Profile" subtitle="Manage your profile information" />

      <Card className="overflow-hidden">
        <div
          className="h-28 w-full relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #0f172a 100%)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 rounded-full opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle, #f97316, transparent 65%)" }}
          />
          <div className="absolute top-4 right-6 opacity-10 pointer-events-none">
            <Zap size={80} strokeWidth={0.5} className="text-orange-500 rotate-12" />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: "linear-gradient(90deg, #f97316, transparent)" }}
          />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-6">
            <div
              className="w-20 h-20 rounded-2xl border-4 flex items-center justify-center text-2xl font-black text-white shadow-xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                borderColor: "var(--card)",
                boxShadow: "0 8px 32px rgba(249, 115, 22, 0.35)",
              }}
            >
              {getInitials(profile.name)}
            </div>
            <div className="pb-1 flex-1">
              <h2 className="text-lg font-black" style={{ color: "var(--foreground)" }}>
                {profile.name || "Loading..."}
              </h2>
              <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                {profile.role} · {profile.department}
              </p>
            </div>
            <div className="pb-1">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{ border: "1px solid var(--border)", color: "var(--muted)", background: "var(--background)" }}
                >
                  <Edit size={14} /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Save size={14} /> {saving ? "Updating..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {FIELDS.map(({ label, key, type, icon: Icon }) => (
              <div key={key}>
                <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted)" }}>
                  {label}
                </label>
                <div className="relative">
                  {Icon && (
                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  )}
                  <input
                    type={type}
                    name={key}
                    value={profile[key]}
                    disabled={!editing}
                    onChange={handleChange}
                    className={`w-full py-2.5 text-sm rounded-xl border outline-none transition-all disabled:opacity-60 font-medium ${Icon ? "pl-8 pr-3" : "px-3"}`}
                    style={{
                      background: "var(--background)",
                      border: `1px solid var(--border)`,
                      color: "var(--foreground)",
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

export default Profile;