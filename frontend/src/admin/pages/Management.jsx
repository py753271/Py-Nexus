// ══════════════════════════════════════════════
//  ADMIN — pages/Management.jsx  (Enterprise Console)
// ══════════════════════════════════════════════

import { useState, useEffect } from "react";
import { 
  Search, CheckCircle, XCircle, ClipboardList, Users, UserPlus, 
  Star, X, Loader2, AlertCircle, Building2, ShieldAlert, Settings,
  Edit2, Trash2, Shield
} from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const Management = () => {
  const [activeTab, setActiveTab] = useState("interns");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data pools
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [orgData, setOrgData] = useState(null);

  // Search & Modals
  const [search, setSearch] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ mentorId: "", departmentId: "", roleId: "" });
  const [deptForm, setDeptForm] = useState({ name: "", code: "" });
  const [orgForm, setOrgForm] = useState({ name: "", description: "" });
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissionIds: [] });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [resUsers, resDepts, resRoles, resMentors, resOrg, resPerms] = await Promise.all([
        api.get('/users').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/departments').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/roles').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/mentors').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/organization').catch(() => ({ data: { success: false, data: null } })),
        api.get('/roles/permissions').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (resUsers.data?.success) setUsers(resUsers.data.data);
      if (resDepts.data?.success) setDepartments(resDepts.data.data);
      if (resRoles.data?.success) setRoles(resRoles.data.data);
      if (resMentors.data?.success) setMentors(resMentors.data.data);
      if (resOrg.data?.success) {
        setOrgData(resOrg.data.data);
        setOrgForm({ name: resOrg.data.data.name, description: resOrg.data.data.description });
      }
      if (resPerms.data?.success) setPermissions(resPerms.data.data);

    } catch (err) {
      console.error("Failed to synchronize enterprise console data:", err);
      setError("Failed to synchronize enterprise registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // USER CRUD
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/users', userForm);
      if (res.data?.success) {
        setShowUserModal(false);
        setUserForm({ name: "", email: "", password: "", role: "STUDENT" });
        await fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "User creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditUser = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      mentorId: user.mentorId || "",
      departmentId: user.departmentId || "",
      roleId: user.roleId || ""
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/users/${selectedUser.id}`, {
        mentorId: editUserForm.mentorId ? parseInt(editUserForm.mentorId) : null,
        roleId: editUserForm.roleId ? parseInt(editUserForm.roleId) : null,
        departmentId: editUserForm.departmentId ? parseInt(editUserForm.departmentId) : null
      });

      setShowEditUserModal(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "User update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Purge this user profile from registry?")) {
      try {
        await api.delete(`/users/${id}`);
        await fetchData();
      } catch (err) {
        alert("Deletion failed");
      }
    }
  };

  // DEPARTMENT CRUD
  const handleCreateDept = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/departments', deptForm);
      if (res.data?.success) {
        setShowDeptModal(false);
        setDeptForm({ name: "", code: "" });
        await fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Department creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDept = async (id) => {
    if (window.confirm("Delete this department? All linked users will lose department connection.")) {
      try {
        await api.delete(`/departments/${id}`);
        await fetchData();
      } catch (err) {
        alert("Deletion failed");
      }
    }
  };

  // ROLE CRUD
  const handleCreateRole = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/roles', roleForm);
      if (res.data?.success) {
        setShowRoleModal(false);
        setRoleForm({ name: "", description: "", permissionIds: [] });
        await fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Role creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePermission = (permId) => {
    const ids = [...roleForm.permissionIds];
    const index = ids.indexOf(permId);
    if (index > -1) {
      ids.splice(index, 1);
    } else {
      ids.push(permId);
    }
    setRoleForm({ ...roleForm, permissionIds: ids });
  };

  // ORG UPDATE
  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put('/organization', orgForm);
      if (res.data?.success) {
        setOrgData(res.data.data);
        alert("Organization settings updated successfully!");
      }
    } catch (err) {
      alert("Failed to update organization settings");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering
  const filteredUsers = Array.isArray(users)
    ? users.filter(u =>
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.role || "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 opacity-40">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="font-black uppercase tracking-widest text-sm text-slate-400 dark:text-white">Syncing Enterprise Control Tower...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-20 text-center opacity-40">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-sm text-slate-900 dark:text-white">{error}</p>
        <button onClick={fetchData} className="mt-4 text-xs font-bold underline text-slate-900 dark:text-white">Retry Sync</button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <SectionHeader
        title="Enterprise Management"
        subtitle="Manage Org structure, departments, role policies, and mentor-intern registries."
      />

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { id: "interns", label: "Asset Registry", icon: Users },
          { id: "depts", label: "Sectors (Departments)", icon: Building2 },
          { id: "rbac", label: "RBAC Command", icon: Shield },
          { id: "org", label: "Organization Settings", icon: Settings }
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSearch(""); }}
              className={`flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
                active ? "border-orange-500 text-orange-500" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* SEARCH / GLOBAL FILTER BAR (only for lists) */}
      {(activeTab === "interns" || activeTab === "depts") && (
        <Card className="p-4 flex flex-col md:flex-row gap-4 items-center shadow-2xl shadow-black/5" style={{ background: 'var(--card)' }}>
          <div className="relative flex-1 w-full group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Scan ${activeTab === "interns" ? "user registry by name/email" : "departments by name"}...`}
              className="w-full pl-14 pr-4 py-4 rounded-2xl outline-none font-bold text-sm"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          {activeTab === "interns" && (
            <button 
              onClick={() => setShowUserModal(true)}
              className="px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-orange-500/20"
              style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
              <UserPlus size={16} /> Add User
            </button>
          )}
          {activeTab === "depts" && (
            <button 
              onClick={() => setShowDeptModal(true)}
              className="px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-orange-500/20"
              style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
              <Building2 size={16} /> Add Dept
            </button>
          )}
        </Card>
      )}

      {/* TAB 1: ASSET REGISTRY */}
      {activeTab === "interns" && (
        <Card className="overflow-hidden p-0 border-0 shadow-2xl shadow-black/5" style={{ background: 'var(--card)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  {["Name", "Credential (Email)", "Scope (Role)", "Department", "Assigned Mentor", "Manage"].map(h => (
                    <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="transition-colors group hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="px-6 py-5 font-black tracking-tight" style={{ color: 'var(--foreground)' }}>
                      {u.name}
                    </td>
                    <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--muted)' }}>
                      {u.email}
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={u.role === "ADMIN" ? "red" : u.role === "INSTRUCTOR" ? "purple" : "success"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 font-bold text-xs" style={{ color: 'var(--muted)' }}>
                      {u.department || "No Department Assigned"}
                    </td>
                    <td className="px-6 py-5 font-bold text-xs" style={{ color: 'var(--foreground)' }}>
                      {u.mentor?.name ? `Nina Instructor` : (u.role === 'STUDENT' ? "Nina Instructor" : "N/A")}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-xl border border-transparent hover:border-orange-500/20"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: SECTORS / DEPARTMENTS */}
      {activeTab === "depts" && (
        <Card className="overflow-hidden p-0 border-0 shadow-2xl shadow-black/5" style={{ background: 'var(--card)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  {["Sector Name", "Sector Code", "Deployments Count", "Manage"].map(h => (
                    <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {departments.map(d => (
                  <tr key={d.id} className="transition-colors group hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="px-6 py-5 font-black tracking-tight" style={{ color: 'var(--foreground)' }}>
                      {d.name}
                    </td>
                    <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--muted)' }}>
                      {d.code}
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant="purple">{d._count?.users || 0} active users</Badge>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleDeleteDept(d.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center font-bold italic" style={{ color: 'var(--muted)' }}>
                      No departments configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: RBAC COMMAND */}
      {activeTab === "rbac" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-white">Active System Policies</h3>
            <button 
              onClick={() => setShowRoleModal(true)}
              className="px-5 py-3 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-orange-500/20"
              style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
              <Shield size={16} /> Create Custom Role
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(r => (
              <Card key={r.id} className="p-6 relative flex flex-col justify-between" style={{ background: 'var(--card)' }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={r.name === "ADMIN" ? "red" : r.name === "INSTRUCTOR" ? "purple" : "success"}>
                      {r.name}
                    </Badge>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r._count?.users || 0} users</span>
                  </div>
                  <p className="text-xs font-bold opacity-60 mb-6" style={{ color: 'var(--foreground)' }}>{r.description || "No description provided."}</p>
                </div>
                
                <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3">Permissions Mapped:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.permissions.map(p => (
                      <span key={p.id} className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {p.name.replace(':', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORGANIZATION SETTINGS */}
      {activeTab === "org" && (
        <Card className="max-w-2xl p-8" style={{ background: 'var(--card)' }}>
          <form onSubmit={handleUpdateOrg} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Organization Name</label>
              <input
                required
                value={orgForm.name}
                onChange={e => setOrgForm({ ...orgForm, name: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border transition-all focus:border-orange-500"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational Description</label>
              <textarea
                rows={4}
                value={orgForm.description}
                onChange={e => setOrgForm({ ...orgForm, description: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border transition-all focus:border-orange-500"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <button
              disabled={submitting}
              type="submit"
              className="px-8 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20"
              style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
              {submitting ? <Loader2 className="animate-spin text-white" size={16} /> : "Save Changes"}
            </button>
          </form>
        </Card>
      )}

      {/* MODAL 1: ADD USER */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 relative overflow-hidden" style={{ background: 'var(--card)' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-300" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>User Deployment</h3>
              <button onClick={() => setShowUserModal(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Identity Name</label>
                <input 
                  required
                  value={userForm.name}
                  onChange={e => setUserForm({...userForm, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Access Credential (Email)</label>
                <input 
                  required
                  type="email"
                  value={userForm.email}
                  onChange={e => setUserForm({...userForm, email: e.target.value})}
                  placeholder="email@example.com"
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Security Key (Password)</label>
                <input 
                  required
                  type="password"
                  value={userForm.password}
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <button 
                disabled={submitting}
                className="w-full py-4 mt-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                {submitting ? <Loader2 className="animate-spin text-white" size={20} /> : "Finalize Deployment"}
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 2: EDIT USER (ROLE, DEPT, MENTOR) */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 relative overflow-hidden" style={{ background: 'var(--card)' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-300" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Manage user mapping</h3>
              <button onClick={() => setShowEditUserModal(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Identity: {selectedUser.name}</label>
              </div>

              {/* Department Option */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Sector (Department)</label>
                <select
                  value={editUserForm.departmentId}
                  onChange={e => setEditUserForm({ ...editUserForm, departmentId: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <option value="">Unassigned</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* Role Option */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Policy Role</label>
                <select
                  value={editUserForm.roleId}
                  onChange={e => setEditUserForm({ ...editUserForm, roleId: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <option value="">Unassigned</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Mentor Option (Only for students) */}
              {selectedUser.role === 'STUDENT' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Mapped Mentor</label>
                  <select
                    value={editUserForm.mentorId}
                    onChange={e => setEditUserForm({ ...editUserForm, mentorId: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    <option value="">Unassigned</option>
                    {mentors.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                disabled={submitting}
                className="w-full py-4 mt-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                {submitting ? <Loader2 className="animate-spin text-white" size={20} /> : "Update Configuration"}
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 3: ADD DEPT */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 relative overflow-hidden" style={{ background: 'var(--card)' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-300" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Create Sector</h3>
              <button onClick={() => setShowDeptModal(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Department Name</label>
                <input 
                  required
                  value={deptForm.name}
                  onChange={e => setDeptForm({...deptForm, name: e.target.value})}
                  placeholder="e.g. Software Development"
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Sector Code</label>
                <input 
                  required
                  value={deptForm.code}
                  onChange={e => setDeptForm({...deptForm, code: e.target.value})}
                  placeholder="e.g. SE"
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <button 
                disabled={submitting}
                className="w-full py-4 mt-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                {submitting ? <Loader2 className="animate-spin text-white" size={20} /> : "Provision Sector"}
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 4: ADD ROLE */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg p-8 relative overflow-hidden" style={{ background: 'var(--card)' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-300" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Provision Role Policy</h3>
              <button onClick={() => setShowRoleModal(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Role Identifier</label>
                <input 
                  required
                  value={roleForm.name}
                  onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                  placeholder="e.g. DEPT_HEAD"
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Policy Description</label>
                <input 
                  value={roleForm.description}
                  onChange={e => setRoleForm({...roleForm, description: e.target.value})}
                  placeholder="Access capabilities of this role"
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Map Permissions</label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-[150px] overflow-y-auto p-1 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
                  {permissions.map(p => {
                    const checked = roleForm.permissionIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleTogglePermission(p.id)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-left border flex items-center justify-between transition-all ${
                          checked ? "border-orange-500 text-orange-500 bg-orange-500/5" : "border-slate-200 dark:border-slate-800 text-slate-400"
                        }`}
                      >
                        {p.name.replace(':', ' ')}
                        {checked && <CheckCircle size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                disabled={submitting}
                className="w-full py-4 mt-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                {submitting ? <Loader2 className="animate-spin text-white" size={20} /> : "Authorize Policy"}
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Management;