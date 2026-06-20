import React, { useState } from "react";
import UserApp  from "./user/App";
import AdminApp from "./admin/App";
import { Card, PrimaryButton, Avatar } from "./shared/components/UI";
import { ShieldCheck, KeyRound, Lock, User, Mail } from "lucide-react";
import { useUser } from "./context/UserContext";

const AuthGate = () => {
  const { user, login, register, logout, verify2FALogin, loading: authLoading } = useUser();
  const [authPortal, setAuthPortal] = useState(() => localStorage.getItem("py_nexus_portal")); // 'admin' | 'intern'
  const [isSignUp, setIsSignUp] = useState(false);
  const [is2FA, setIs2FA] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState(null);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePortalSelect = (portal) => {
    setAuthPortal(portal);
    localStorage.setItem("py_nexus_portal", portal);
    setIsSignUp(false);
    setIs2FA(false);
    setError("");
    setEmail("");
    setPassword("");
    setOtp("");
    setName("");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      
      const defaultRole = authPortal === 'admin' ? 'ADMIN' : 'STUDENT';
      let res;

      if (isSignUp) {
        res = await register({ name, email, password, role: defaultRole });
      } else {
        res = await login(email, password);
      }

      if (res.success) {
        if (res.requires2FA) {
           setUserIdFor2FA(res.userId);
           setIs2FA(true);
           setLoading(false);
           return;
        }

        const dbRole = res.data.role;
        // Auto-correct portal if it conflicts with the actual role in DB
        if (dbRole === 'ADMIN') {
           setAuthPortal('admin');
           localStorage.setItem("py_nexus_portal", "admin");
        } else {
           setAuthPortal('intern');
           localStorage.setItem("py_nexus_portal", "intern");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || (isSignUp ? "Registration failed." : "Login failed. Check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await verify2FALogin(userIdFor2FA, otp);
      if (res.success) {
        const dbRole = res.data.role;
        if (dbRole === 'ADMIN') {
           setAuthPortal('admin');
           localStorage.setItem("py_nexus_portal", "admin");
        } else {
           setAuthPortal('intern');
           localStorage.setItem("py_nexus_portal", "intern");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid 2FA code.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is already in session and portal check passes
  if (user) {
    const isActuallyAdmin = user.role === 'ADMIN';
    const currentPortal = authPortal || (isActuallyAdmin ? 'admin' : 'intern');
    
    // Clear portal storage on logout
    const handleLogout = () => {
      localStorage.removeItem("py_nexus_portal");
      logout();
    };

    return currentPortal === "admin" && isActuallyAdmin
      ? <AdminApp onLogout={handleLogout} user={user} /> 
      : <UserApp  onLogout={handleLogout} user={user} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <div className="max-w-md w-full">
        {!authPortal ? (
          <Card className="p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" onError={(e) => e.target.style.display='none'} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Select your portal to continue</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => handlePortalSelect("admin")}
                className="w-full group p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Lock size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Admin Portal</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Management & Controls</p>
                </div>
              </button>

              <button 
                onClick={() => handlePortalSelect("intern")}
                className="w-full group p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all text-left flex items-center gap-4"
              >
                 <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Avatar initials="UN" size="sm" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Intern Portal</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Learning & Tasks</p>
                </div>
              </button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                  {is2FA ? <ShieldCheck size={32} /> : <KeyRound size={32} />}
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                {authPortal === "admin" ? "Admin Portal" : "Intern Portal"} - {is2FA ? "Security Check" : (isSignUp ? "Sign Up" : "Login")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {is2FA ? "Enter the 6-digit code from your Authenticator app" : (isSignUp ? "Create a new account" : "Enter your credentials to access the portal")}
              </p>
            </div>

            <div className="space-y-4">
              {is2FA ? (
                <>
                  <div className="flex items-center border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 focus-within:border-blue-500 transition-all">
                    <ShieldCheck size={20} className="text-slate-400" />
                    <input 
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full py-4 px-3 bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-mono tracking-widest text-center text-lg"
                    />
                  </div>
                  {error && <p className="text-center text-red-500 text-xs font-bold">{error}</p>}
                  <button 
                    onClick={handle2FASubmit} 
                    disabled={loading || otp.length !== 6} 
                    className="w-full py-4 rounded-2xl text-lg font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl disabled:opacity-50 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/20"
                  >
                    {loading ? "Verifying..." : "Authenticate"}
                  </button>
                  <div className="flex justify-center mt-4">
                    <button 
                      onClick={() => { setIs2FA(false); setOtp(""); setPassword(""); }}
                      className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {isSignUp && (
                    <div className="flex items-center border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 focus-within:border-blue-500 transition-all">
                      <User size={20} className="text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full py-4 px-3 bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                      />
                    </div>
                  )}

                  <div className="flex items-center border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 focus-within:border-blue-500 transition-all">
                    <Mail size={20} className="text-slate-400" />
                    <input 
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-4 px-3 bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex items-center border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 focus-within:border-blue-500 transition-all">
                    <Lock size={20} className="text-slate-400" />
                    <input 
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-4 px-3 bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                  </div>

                  {error && <p className="text-center text-red-500 text-xs font-bold">{error}</p>}

                  <button 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className={`w-full py-4 rounded-2xl text-lg font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl disabled:opacity-50 mt-2 ${
                      authPortal === 'admin' 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/20' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/20'
                    }`}
                  >
                    {loading ? "Processing..." : (isSignUp ? "Create Account" : "Verify & Continue")}
                  </button>

                  <div className="flex justify-between items-center mt-4">
                    <button 
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    </button>
                    <button 
                      onClick={() => setAuthPortal(null)}
                      className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-300">
                Secured by Py Nexus API
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AuthGate;