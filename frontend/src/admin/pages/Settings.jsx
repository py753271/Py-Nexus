// ══════════════════════════════════════════════
//  ADMIN — pages/Settings.jsx (Control Deck)
// ══════════════════════════════════════════════

import React, { useState } from "react";
import { PaintBucket, ShieldCheck } from "lucide-react";
import { Card, Toggle, SectionHeader } from "../../shared/components/UI";
import { useTheme } from "../../shared/utils/ThemeContext";
import { useUser } from "../../context/UserContext";
import api from "../../utils/api";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useUser();

  // 2FA state
  const [show2FA, setShow2FA] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [otpVerify, setOtpVerify] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error2FA, setError2FA] = useState("");

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
      icon: ShieldCheck,
      rows: [
        { label: "Authenticator Protocol (2FA)", sub: "Require OTP code on admin dashboard login",
          ctrl: <Toggle checked={user?.isTwoFactorActive || false} onChange={handleToggle2FA} />
        },
      ],
    },
    {
      title: "System Preferences",
      icon: PaintBucket,
      rows: [
        { label: "Dark Mode Ecosystem", sub: "Toggle between high-contrast and standard UI themes",
          ctrl: <Toggle checked={theme === "dark"} onChange={toggleTheme} />
        },
      ],
    }
  ];

  return (
    <div className="max-w-3xl space-y-8 pb-12 animate-in fade-in duration-700 relative">
      <SectionHeader title="Control Deck" subtitle="Platform-wide configuration and system preferences" />

      {/* 2FA Setup Modal */}
      {show2FA && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-in fade-in duration-300">
           <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative overflow-hidden bg-[#020617] border border-white/5 shadow-2xl rounded-[2rem]">
              <div className="text-center mb-6">
                 <ShieldCheck size={40} className="text-orange-500 mx-auto mb-4" />
                 <h2 className="text-xl font-black tracking-tight mb-2 text-white">Enable 2FA</h2>
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
                   className="w-full py-4 text-center text-xl font-mono tracking-[0.2em] font-black rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-orange-500 text-white"
                 />
                 {error2FA && <p className="text-red-500 text-xs font-bold text-center mt-2">{error2FA}</p>}
                 <button 
                   onClick={submit2FAOnline}
                   disabled={verifying || otpVerify.length !== 6}
                   className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest bg-orange-500 shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
                 >
                   {verifying ? "Verifying..." : "Confirm Activation"}
                 </button>
                 <button 
                   onClick={() => setShow2FA(false)}
                   className="w-full py-3 font-bold text-sm text-slate-400 hover:text-white transition-colors"
                 >
                   Cancel
                 </button>
              </div>
           </Card>
        </div>
      )}

      <div className="space-y-6">
        {SECTIONS.map(section => (
          <Card key={section.title} className="p-6 sm:p-8 bg-[#020617] border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
               {section.icon && <section.icon size={80} strokeWidth={0.5} className="text-orange-500" />}
            </div>
            
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-8 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              {section.title}
            </h3>
            
            <div className="space-y-8 relative z-10">
              {section.rows.map(row => (
                <div key={row.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <p className="text-sm font-black text-white tracking-tight leading-none mb-1.5">{row.label}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{row.sub}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {row.ctrl}
                  </div>
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