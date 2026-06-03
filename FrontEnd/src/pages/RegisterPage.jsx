import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Check } from "lucide-react";
import { useAuthStore } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

/* ─── Password Strength ─────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair", color: "#f59e0b" };
  if (score <= 3) return { score, label: "Good", color: "#3ecf8e" };
  return { score, label: "Strong", color: "#3d52f5" };
};

const RegisterPage = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  const { register, isRegistering } = useAuthStore();
  const navigate = useNavigate();
  const strength = getStrength(userPassword);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const clearError = () => { if (errorMessage) setErrorMessage(""); };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const result = await register({ user_name: userName, user_email: userEmail, user_password: userPassword });
      if (result?.success) navigate("/login");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
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
        .input-field.has-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239,68,68,0.08);
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
        .float-2 { animation: float 5.5s ease-in-out infinite 1s; }
        .float-3 { animation: float 6s ease-in-out infinite 1.8s; }

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

        .strength-bar {
          height: 4px;
          border-radius: 99px;
          transition: width 0.35s ease, background 0.35s ease;
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

        {/* Floating UI cards */}
        <div className="relative w-96 h-96">

          {/* Card 1: Profile setup */}
          <div className="float-2 absolute -top-10 -left-8 card-glass px-5 py-4 w-52">
            <p style={{ fontSize: 10, fontWeight: 700, color: "#7b82a0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Your Profile</p>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-fuchsia-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">S</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1d2e" }}>StudyHub User</div>
                <div style={{ fontSize: 10, color: "#a8b0cc" }}>Member since today</div>
              </div>
            </div>
            <div className="mt-3 flex gap-1.5">
              {["Physics", "Math", "CS"].map((t) => (
                <span key={t} style={{ fontSize: 9, fontWeight: 700, background: "rgba(67,97,238,0.1)", color: "#4361ee", borderRadius: 6, padding: "3px 7px" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Card 2: Progress */}
          <div className="float-1 absolute top-6 -right-14 card-glass px-4 py-4 w-44">
            <p style={{ fontSize: 10, fontWeight: 700, color: "#7b82a0", marginBottom: 8 }}>Weekly streak</p>
            <div className="flex gap-1">
              {[true,true,true,false,false,false,false].map((done, i) => (
                <div key={i} style={{
                  flex: 1, height: 28, borderRadius: 6,
                  background: done ? "linear-gradient(135deg,#4361ee,#7b5cf0)" : "#f0f1f8",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {done && <Check size={10} color="white" strokeWidth={3} />}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 10, color: "#4361ee", fontWeight: 700, marginTop: 8 }}>3 days strong 🔥</p>
          </div>

          {/* Center illustration */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="card-glass w-52 h-52 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-300/40">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1d2e", textAlign: "center", lineHeight: 1.4 }}>Join thousands<br/>of learners.</p>
            </div>
          </div>

          {/* Card 3: Subject count */}
          <div className="float-3 absolute -bottom-4 left-0 card-glass px-4 py-2.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>Free · Unlimited articles</span>
          </div>

          {/* Card 4: badge */}
          <div className="float-2 absolute bottom-10 -right-10 card-glass px-4 py-2">
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7b5cf0" }}>✨ Start for free</span>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 36, color: "#1a1d2e", lineHeight: 1.15 }}>
            Start your<br/><span style={{ color: "#3d52f5" }}>journey today.</span>
          </p>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex flex-1 items-center justify-center p-6 mesh-bg lg:bg-white relative">
        <div className="absolute inset-0 lg:hidden mesh-bg" />

        <div className={`relative z-10 w-full max-w-sm slide-up ${mounted ? "visible" : ""}`}>

          {/* Logo mark */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-300/40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#1a1d2e" }}>StudyHub</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 36, color: "#1a1d2e", lineHeight: 1.1, marginBottom: 8 }}>
              Create your<br/>account.
            </h1>
            <p style={{ color: "#7b82a0", fontSize: 14 }}>
              Free forever. No credit card needed.
            </p>
          </div>

          {/* Error banner */}
          {errorMessage && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* Name */}
            <div className="mb-4">
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4a4f6a", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#a8b0cc" }} />
                <input
                  className="input-field"
                  type="text"
                  value={userName}
                  onChange={(e) => { setUserName(e.target.value); clearError(); }}
                  required
                  placeholder="Alex Carter"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4a4f6a", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#a8b0cc" }} />
                <input
                  className="input-field"
                  type="email"
                  value={userEmail}
                  onChange={(e) => { setUserEmail(e.target.value); clearError(); }}
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4a4f6a", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#a8b0cc" }} />
                <input
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  value={userPassword}
                  onChange={(e) => { setUserPassword(e.target.value); clearError(); }}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
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

              {/* Strength meter */}
              {userPassword && (
                <div className="mt-2.5">
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {[1,2,3,4].map((n) => (
                      <div key={n} className="strength-bar" style={{
                        flex: 1,
                        background: strength.score >= n ? strength.color : "#e8eaf4"
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: strength.color }}>{strength.label} password</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="cta-btn" disabled={isRegistering}>
              {isRegistering ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div style={{ flex: 1, height: 1, background: "#e8eaf4" }} />
            <span style={{ fontSize: 12, color: "#b0b6cc", fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e8eaf4" }} />
          </div>

          {/* Sign in link */}
          <p style={{ textAlign: "center", fontSize: 14, color: "#7b82a0" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#3d52f5", fontWeight: 700, textDecoration: "none" }}>
              Sign in →
            </Link>
          </p>

          {/* Fine print */}
          <p style={{ textAlign: "center", fontSize: 11, color: "#b0b6cc", marginTop: 16, lineHeight: 1.6 }}>
            By signing up you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;