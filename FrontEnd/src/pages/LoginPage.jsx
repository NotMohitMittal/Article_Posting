import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

/* ─── Floating Card Decoration ─────────────────────────────────── */
const FloatingCard = ({ style, children, className = "" }) => (
  <div
    className={`absolute rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md shadow-xl shadow-indigo-200/30 ${className}`}
    style={style}
  >
    {children}
  </div>
);

/* ─── Animated Dot ──────────────────────────────────────────────── */
const Dot = ({ color, style }) => (
  <div
    className="absolute rounded-full animate-bounce"
    style={{ width: 12, height: 12, background: color, ...style }}
  />
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger entrance animations after mount
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login({ user_email: email, user_password: password });
    if (result?.success) navigate("/");
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

        .mesh-bg {
          background: #eef0ff;
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(138,127,255,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(93,168,255,0.15) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 60% 20%, rgba(255,154,215,0.12) 0%, transparent 50%);
        }

        .input-field {
          width: 100%;
          padding: 14px 16px 14px 46px;
          border: 1.5px solid #e2e5f0;
          border-radius: 14px;
          background: rgba(255,255,255,0.85);
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          color: #1a1d2e;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          backdrop-filter: blur(8px);
        }
        .input-field::placeholder { color: #a8b0cc; }
        .input-field:focus {
          border-color: #4361ee;
          box-shadow: 0 0 0 4px rgba(67,97,238,0.08);
        }

        .cta-btn {
          width: 100%;
          padding: 15px 24px;
          background: #3d52f5;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 6px 24px rgba(61,82,245,0.32);
          letter-spacing: 0.01em;
        }
        .cta-btn:hover:not(:disabled) {
          background: #2a3ee0;
          transform: translateY(-1px);
          box-shadow: 0 10px 32px rgba(61,82,245,0.38);
        }
        .cta-btn:active:not(:disabled) { transform: translateY(0); }
        .cta-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .slide-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .slide-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float-1 { animation: float 4.5s ease-in-out infinite; }
        .float-2 { animation: float 5.5s ease-in-out infinite 0.8s; }
        .float-3 { animation: float 6s ease-in-out infinite 1.5s; }

        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .dot-1 { animation: bounce-custom 2s ease-in-out infinite; }
        .dot-2 { animation: bounce-custom 2s ease-in-out infinite 0.3s; }
        .dot-3 { animation: bounce-custom 2s ease-in-out infinite 0.6s; }
        .dot-4 { animation: bounce-custom 2s ease-in-out infinite 0.9s; }

        .card-glass {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(16px);
          border: 1.5px solid rgba(255,255,255,0.85);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(100,110,200,0.12), 0 4px 16px rgba(0,0,0,0.06);
        }
      `}</style>

      {/* ── Left Panel: Decorative ── */}
      <div className="hidden lg:flex flex-1 mesh-bg relative items-center justify-center overflow-hidden">

        {/* Dot row */}
        <div className="absolute top-10 left-10 flex gap-2">
          {["#ff6b6b","#4361ee","#3ecf8e","#f59e0b"].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-full dot-${i+1}`} style={{ background: c }} />
          ))}
        </div>

        {/* Floating UI cards — inspired by Wix hero */}
        <div className="relative w-96 h-96">

          {/* Card 1: Article preview */}
          <div className="float-1 absolute -top-8 -left-12 card-glass px-5 py-4 w-56">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">A</div>
              <div>
                <div className="text-[11px] font-semibold text-gray-800">New Article</div>
                <div className="text-[10px] text-gray-400">Physics · 4 min read</div>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-indigo-100 mb-1.5">
              <div className="h-1.5 rounded-full bg-indigo-500 w-3/4" />
            </div>
            <div className="h-1.5 rounded-full bg-indigo-50 w-1/2" />
          </div>

          {/* Card 2: Subject badge */}
          <div className="float-2 absolute top-8 -right-12 card-glass px-4 py-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-800">StudyHub</div>
              <div className="text-[10px] text-sky-500 font-semibold">12 subjects active</div>
            </div>
          </div>

          {/* Center illustration */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="card-glass w-52 h-52 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-300/40">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <p className="text-sm font-bold text-gray-800 text-center leading-tight">Your knowledge<br/>hub awaits.</p>
            </div>
          </div>

          {/* Card 3: Tag */}
          <div className="float-3 absolute -bottom-6 left-2 card-glass px-4 py-2.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-gray-700">Live · 3 new articles</span>
          </div>

          {/* Card 4: Read time pill */}
          <div className="float-1 absolute bottom-8 -right-10 card-glass px-4 py-2">
            <span className="text-[11px] font-bold text-violet-600">📚 Reading mode on</span>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 36, color: "#1a1d2e", lineHeight: 1.15 }}>
            Learn without<br/><span style={{ color: "#3d52f5" }}>limits.</span>
          </p>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex flex-1 mesh-bg lg:bg-white items-center justify-center p-6 relative">

        {/* Mobile mesh */}
        <div className="absolute inset-0 lg:hidden mesh-bg" />

        <div className={`relative z-10 w-full max-w-sm slide-up ${mounted ? "visible" : ""}`} style={{ transitionDelay: "0.05s" }}>

          {/* Logo mark */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-300/40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#1a1d2e", letterSpacing: "-0.01em" }}>StudyHub</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 38, color: "#1a1d2e", lineHeight: 1.1, marginBottom: 8 }}>
              Welcome<br/>back.
            </h1>
            <p style={{ color: "#7b82a0", fontSize: 14, fontWeight: 400 }}>
              Sign in to continue your learning journey.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-4" style={{ transitionDelay: "0.1s" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4a4f6a", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#a8b0cc" }} />
                <input
                  className="input-field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4a4f6a", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#a8b0cc" }} />
                <input
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ paddingRight: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#a8b0cc", display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="cta-btn" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div style={{ flex: 1, height: 1, background: "#e8eaf4" }} />
            <span style={{ fontSize: 12, color: "#b0b6cc", fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e8eaf4" }} />
          </div>

          {/* Sign up prompt */}
          <p style={{ textAlign: "center", fontSize: 14, color: "#7b82a0" }}>
            No account yet?{" "}
            <Link to="/register" style={{ color: "#3d52f5", fontWeight: 700, textDecoration: "none" }}>
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;