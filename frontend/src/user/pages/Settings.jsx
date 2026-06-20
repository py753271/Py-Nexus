import React, { useState } from "react";
import { Card, Toggle, SectionHeader } from "../../shared/components/UI";
import { useTheme } from "../../shared/utils/ThemeContext";
import { User, Save, Lock, PaintBucket, ShieldCheck } from "lucide-react";
import { useUser } from "../../context/UserContext";
import api from "../../utils/api";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useUser();
  
  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  // 2FA state
  const [show2FA, setShow2FA] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [otpVerify, setOtpVerify] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error2FA, setError2FA] = useState("");

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const res = await api.patch('/users/profile', { name, password: password || undefined });
      if (res.data.success) {
        alert("Security & Profile updated successfully!");
        if (setUser) setUser(res.data.data); 
        setPassword("");
      }
    } catch (err) {
      alert("Update rejected by security protocols.");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggle2FA = async () => {
    if (user?.isTwoFactorActive) {
      // Disable 2FA
      try {
        const res = await api.post('/auth/2fa/disable');
        if (res.data.success) {
           setUser({...user, isTwoFactorActive: false});
           alert("2FA Disabled Successfully.");
        }
      } catch (err) {
        alert("Failed to disable 2FA.");
      }
    } else {
      // Enable 2FA Setup
      try {
        const res = await api.post('/auth/2fa/generate');
        if (res.data.success) {
           setQrCodeData(res.data.qrCode);
           setShow2FA(true);
           setOtpVerify("");
           setError2FA("");
        }
      } catch (err) {
        alert("Failed to initialize 2FA setup.");
      }
    }
  };

  const submit2FAOnline = async () => {
    setVerifying(true);
    setError2FA("");
    try {
      const res = await api.post('/auth/2fa/verify-setup', { token: otpVerify });
      if (res.data.success) {
        setUser({...user, isTwoFactorActive: true});
        setShow2FA(false);
        setOtpVerify("");
        alert("2FA Successfully Activated!");
      }
    } catch (err) {
      setError2FA(err.response?.data?.message || "Verification Failed.");
    } finally {
      setVerifying(false);
    }
  };

  const SECTIONS = [
    {
      title: "Core Security",
      icon: <ShieldCheck size={18} className="text-blue-500" />,
      rows: [
        { label: "Authenticator Protection (2FA)", sub: "Require OTP verified code on login", ctrl: <Toggle checked={user?.isTwoFactorActive || false} onChange={handleToggle2FA} /> },
      ],
    },
    {
      title: "Appearance",
      icon: <PaintBucket size={18} className="text-orange-500" />,
      rows: [
        { label: "Dark Mode", sub: "Switch between light and dark themes", ctrl: <Toggle checked={theme === "dark"} onChange={toggleTheme} /> },
      ],
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 pb-20 relative">
      <SectionHeader title="Settings" subtitle="Manage your account preferences and security credentials" />

      {/* 2FA Setup Modal */}
      {show2FA && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-300">
           <Card className="max-w-md w-full p-8 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2rem]">
              <div className="text-center mb-6">
                 <ShieldCheck size={40} className="text-blue-500 mx-auto mb-4" />
                 <h2 className="text-xl font-black tracking-tight mb-2">Enable 2FA</h2>
                 <p className="text-sm font-medium text-slate-500">Scan this QR Code with Google Authenticator or Authy to bind your device.</p>
              </div>
              <div className="flex justify-center mb-8 bg-white p-4 rounded-xl shadow-inner border border-slate-100">
                 {qrCodeData && <img src={qrCodeData} alt="2FA QR Code" className="w-48 h-48" />}
              </div>
              <div className="space-y-4">
                 <input 
                   maxLength={6}
                   value={otpVerify}
                   onChange={e => setOtpVerify(e.target.value.replace(/\D/g, ''))}
                   placeholder="Enter 6-Digit Code"
                   className="w-full py-4 text-center text-xl font-mono tracking-[0.2em] font-black rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                 />
                 {error2FA && <p className="text-red-500 text-xs font-bold text-center mt-2">{error2FA}</p>}
                 <button 
                   onClick={submit2FAOnline}
                   disabled={verifying || otpVerify.length !== 6}
                   className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                 >
                   {verifying ? "Verifying..." : "Confirm Activation"}
                 </button>
                 <button 
                   onClick={() => setShow2FA(false)}
                   className="w-full py-3 font-bold text-sm text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                 >
                   Cancel
                 </button>
              </div>
           </Card>
        </div>
      )}

      <div className="grid gap-6">
        {/* Core Profile & Security */}
        <Card className="p-8 border-orange-500/20">
           <div className="flex items-center gap-3 mb-8">
              <User size={20} className="text-orange-500" />
              <h3 className="text-base font-black tracking-widest uppercase">Identity & Credentials</h3>
           </div>
           
           <div className="space-y-6">
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">Full Identity Name</label>
                 <input 
                   value={name} onChange={e => setName(e.target.value)}
                   className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 outline-none font-bold"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">Secure Passkey (Leave blank to keep current)</label>
                 <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                    <input 
                      type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Enter new passkey..."
                      className="w-full pl-12 pr-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 outline-none font-bold"
                    />
                 </div>
              </div>
              <button 
                onClick={handleUpdateProfile}
                disabled={updating}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                <Save size={18} /> {updating ? "Writing Data..." : "Apply Security Changes"}
              </button>
           </div>
        </Card>

        {/* Toggles */}
        {SECTIONS.map(section => (
          <Card key={section.title} className="p-6 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              {section.icon}
              <h3 className="text-sm font-black tracking-tight uppercase">{section.title}</h3>
            </div>
            <div className="space-y-6">
              {section.rows.map(row => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold">{row.label}</p>
                    <p className="text-xs mt-1 font-medium opacity-50">{row.sub}</p>
                  </div>
                  {row.ctrl}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settings;