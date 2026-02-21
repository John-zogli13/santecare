import { useState, useEffect, useRef } from "react";

// ─── Mock deps — replace with real imports ────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];
const saveCardioEntry = (e) => console.log("saved", e);

// ─── Animated heart ECG ring ──────────────────────────────────────────────────
const HeartRing = ({ status }) => {
  const colors = { good: "#22c55e", warning: "#f59e0b", danger: "#ef4444" };
  const color = colors[status] || "#ef4444";
  const glows = { good: "0 0 40px rgba(34,197,94,0.4)", warning: "0 0 40px rgba(245,158,11,0.4)", danger: "0 0 40px rgba(239,68,68,0.4)" };

  return (
    <div style={{ position: "relative", width: 180, height: 180 }}>
      <svg viewBox="0 0 180 180" style={{ width: 180, height: 180, filter: `drop-shadow(${glows[status]})` }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle cx="90" cy="90" r="82" fill="url(#ringGrad)" stroke={color} strokeWidth="1.5" strokeOpacity="0.25" />
        {/* Animated progress ring */}
        <circle
          cx="90" cy="90" r="74"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeOpacity="0.6"
          strokeDasharray="465"
          strokeDashoffset="0"
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ animation: "ringDraw 1.2s cubic-bezier(0.34,1.56,0.64,1) both" }}
        />
        {/* Inner glow */}
        <circle cx="90" cy="90" r="60" fill={color} fillOpacity="0.04" />
      </svg>
      {/* Heart icon center */}
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6
      }}>
        <div style={{ fontSize: 40, animation: status === "danger" ? "heartbeat 0.8s ease infinite" : "heartbeat 1.2s ease infinite" }}>
          ❤️
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: color, opacity: 0.8
        }}>
          {status === "good" ? "Optimal" : status === "warning" ? "Attention" : "Risque"}
        </div>
      </div>
      <style>{`
        @keyframes ringDraw {
          from { stroke-dashoffset: 465; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes heartbeat {
          0%,100% { transform: scale(1); }
          14% { transform: scale(1.18); }
          28% { transform: scale(1); }
          42% { transform: scale(1.12); }
          70% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// ─── BMI gauge ────────────────────────────────────────────────────────────────
const BMIGauge = ({ bmi }) => {
  const pct = Math.min(Math.max((bmi - 10) / (45 - 10), 0), 1);
  const color = bmi > 30 ? "#ef4444" : bmi > 25 ? "#f59e0b" : "#22c55e";
  const label = bmi > 30 ? "Obésité" : bmi > 25 ? "Surpoids" : bmi > 18.5 ? "Normal" : "Insuffisant";

  return (
    <div style={{ padding: "14px 0 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>IMC calculé</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color }}>{bmi}</span>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 100,
            background: `${color}18`, border: `1px solid ${color}33`, color
          }}>{label}</span>
        </span>
      </div>
      {/* Track */}
      <div style={{ position: "relative", height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.06)" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, #22c55e 30%, #f59e0b 55%, #ef4444 100%)",
          borderRadius: 4,
        }} />
        {/* Thumb */}
        <div style={{
          position: "absolute", top: "50%", left: `${pct * 100}%`,
          transform: "translate(-50%, -50%)",
          width: 16, height: 16, borderRadius: "50%",
          background: color,
          boxShadow: `0 0 0 3px rgba(0,0,0,0.5), 0 0 12px ${color}88`,
          transition: "left 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          border: "2px solid rgba(255,255,255,0.2)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        {["18.5", "25", "30"].map(v => (
          <span key={v} style={{ fontSize: 10, color: "#334155" }}>{v}</span>
        ))}
      </div>
    </div>
  );
};

// ─── Numeric stepper ──────────────────────────────────────────────────────────
const NumStepper = ({ label, value, onChange, unit, min, max, step = 1, accent = "#ef4444" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: accent }}>
        {value}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2, color: "#64748b" }}>{unit}</span>
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        style={{
          width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.05)", color: "#94a3b8", fontSize: 20, lineHeight: 1,
          cursor: "pointer", display: "grid", placeItems: "center",
          transition: "all 0.15s", flexShrink: 0,
        }}
        onMouseEnter={e => { e.target.style.background = `${accent}22`; e.target.style.borderColor = `${accent}44`; e.target.style.color = accent; }}
        onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.color = "#94a3b8"; }}
      >−</button>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, height: 4, accentColor: accent }}
      />
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        style={{
          width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.05)", color: "#94a3b8", fontSize: 20, lineHeight: 1,
          cursor: "pointer", display: "grid", placeItems: "center",
          transition: "all 0.15s", flexShrink: 0,
        }}
        onMouseEnter={e => { e.target.style.background = `${accent}22`; e.target.style.borderColor = `${accent}44`; e.target.style.color = accent; }}
        onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.color = "#94a3b8"; }}
      >+</button>
    </div>
  </div>
);

// ─── Factor row ───────────────────────────────────────────────────────────────
const FactorRow = ({ label, status, delay = 0 }) => {
  const cfg = {
    good:    { color: "#22c55e", icon: "✓", bg: "rgba(34,197,94,0.1)" },
    warning: { color: "#f59e0b", icon: "!", bg: "rgba(245,158,11,0.1)" },
    danger:  { color: "#ef4444", icon: "✕", bg: "rgba(239,68,68,0.1)"  },
  }[status];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      animation: `slideIn 0.4s ease ${delay}ms both`,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
        background: cfg.bg, border: `1px solid ${cfg.color}33`,
        display: "grid", placeItems: "center",
        fontSize: 11, fontWeight: 700, color: cfg.color,
      }}>{cfg.icon}</div>
      <span style={{ fontSize: 13, color: "#94a3b8", flex: 1 }}>{label}</span>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
    </div>
  );
};

// ─── Supplement card ──────────────────────────────────────────────────────────
const SuppCard = ({ name, reason, sources, delay = 0 }) => (
  <div style={{
    display: "flex", gap: 12, padding: "14px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    animation: `slideUp 0.5s ease ${delay}ms both`,
    transition: "background 0.2s, border-color 0.2s",
    cursor: "default",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
  >
    <span style={{ fontSize: 22, marginTop: 2 }}>💊</span>
    <div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{name}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.5 }}>{reason}</div>
      <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>🌿 {sources}</div>
    </div>
  </div>
);

// ─── Blood pressure display ───────────────────────────────────────────────────
const BPDisplay = ({ systolic, diastolic }) => {
  const bpColor = systolic > 140 || diastolic > 90 ? "#ef4444"
                : systolic > 130 || diastolic > 85 ? "#f59e0b"
                : "#22c55e";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 0 4px",
    }}>
      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, color: bpColor }}>{systolic}</span>
      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, color: "#334155", margin: "0 2px", paddingBottom: 4 }}>/</span>
      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, color: bpColor }}>{diastolic}</span>
      <span style={{ fontSize: 13, color: "#475569", marginLeft: 6, paddingBottom: 6 }}>mmHg</span>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CardioPage() {
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [smoking, setSmoking] = useState("none");
  const [exercise, setExercise] = useState("1-2");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10;

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const factors = [];
      if (bmi > 30)      factors.push({ label: `IMC ${bmi} — obésité`, status: "danger" });
      else if (bmi > 25) factors.push({ label: `IMC ${bmi} — surpoids`, status: "warning" });
      else               factors.push({ label: `IMC ${bmi} — normal`, status: "good" });

      if (systolic > 140 || diastolic > 90)      factors.push({ label: `Tension ${systolic}/${diastolic} — élevée`, status: "danger" });
      else if (systolic > 130 || diastolic > 85) factors.push({ label: `Tension ${systolic}/${diastolic} — limite`, status: "warning" });
      else                                        factors.push({ label: `Tension ${systolic}/${diastolic} — normale`, status: "good" });

      if (smoking === "regular")   factors.push({ label: "Tabagisme régulier", status: "danger" });
      else if (smoking === "occasional") factors.push({ label: "Tabagisme occasionnel", status: "warning" });
      else                         factors.push({ label: "Non-fumeur", status: "good" });

      if (age > 50) factors.push({ label: `Âge ${age} — facteur de risque`, status: "warning" });
      else          factors.push({ label: `Âge ${age}`, status: "good" });

      if (exercise === "none") factors.push({ label: "Aucune activité physique", status: "danger" });
      else if (exercise === "1-2") factors.push({ label: "Activité modérée", status: "warning" });
      else                         factors.push({ label: "Activité régulière", status: "good" });

      const riskCount = factors.filter(f => f.status === "danger").length;
      let status = "good";
      if (riskCount >= 3) status = "danger";
      else if (riskCount >= 2) status = "warning";

      const entry = { date: getToday(), age, weight, height, bmi, systolic, diastolic, smoking, exercise, riskFactors: riskCount, status, factors };
      saveCardioEntry(entry);
      setResult(entry);
      setAnalyzing(false);
    }, 1000);
  };

  const statusConfig = {
    good:    { label: "Bilan cardiovasculaire OK",          color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
    warning: { label: "Facteurs à surveiller",              color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    danger:  { label: "Risque élevé — Consultez un médecin", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };

  const smokingOpts = [
    { val: "none",       label: "Non-fumeur",  icon: "🚭" },
    { val: "occasional", label: "Occasionnel", icon: "🌫️" },
    { val: "regular",    label: "Régulier",    icon: "🚬" },
  ];
  const exerciseOpts = [
    { val: "none", label: "Aucune",  icon: "🛋️", sub: "0×/sem" },
    { val: "1-2",  label: "Modérée", icon: "🚶", sub: "1–2×/sem" },
    { val: "3+",   label: "Régulière", icon: "🏃", sub: "3+×/sem" },
  ];

  const card = (delay, children, style = {}) => (
    <div style={{
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18, padding: 18,
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background 0.2s, border-color 0.2s`,
      ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.035)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
    >
      {children}
    </div>
  );

  const lbl = (text) => (
    <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
      {text}
    </div>
  );

  const segBtn = (val, current, onChange, { label, icon, sub }) => {
    const active = val === current;
    return (
      <button key={val} onClick={() => onChange(val)} style={{
        padding: "12px 6px", borderRadius: 12,
        border: `1px solid ${active ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.07)"}`,
        background: active ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)",
        color: active ? "#ef4444" : "#64748b",
        cursor: "pointer", fontSize: 13, fontWeight: 500,
        fontFamily: "'DM Sans',sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        boxShadow: active ? "0 0 20px rgba(239,68,68,0.12), inset 0 0 12px rgba(239,68,68,0.05)" : "none",
        transform: active ? "scale(1.02)" : "scale(1)",
        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        {label}
        {sub && <span style={{ fontSize: 10, color: active ? "rgba(239,68,68,0.6)" : "#334155" }}>{sub}</span>}
      </button>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080d14; }

        .cardio-root {
          min-height: 100vh;
          background: #080d14;
          background-image:
            radial-gradient(ellipse 60% 40% at 50% -10%, rgba(239,68,68,0.1) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(239,68,68,0.06) 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          padding: 0 0 60px;
          overflow-x: hidden;
        }

        .cardio-header {
          position: sticky; top: 0; z-index: 50;
          padding: 18px 20px 16px;
          background: rgba(8,13,20,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(239,68,68,0.08);
          display: flex; align-items: center; gap: 12px;
          opacity: 0; transform: translateY(-16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .cardio-header.mounted { opacity: 1; transform: translateY(0); }
        .header-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.25);
          display: grid; place-items: center; font-size: 18px;
          animation: heartbeat 1.5s ease infinite;
        }
        @keyframes heartbeat {
          0%,100% { transform: scale(1); }
          14% { transform: scale(1.15); }
          28% { transform: scale(1); }
          42% { transform: scale(1.08); }
          70% { transform: scale(1); }
        }

        .header-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700; letter-spacing: -0.3px; color: #f0f9ff;
        }
        .header-sub { font-size: 11px; color: #64748b; margin-top: 1px; }

        .cardio-content {
          max-width: 420px; margin: 0 auto;
          padding: 28px 20px 0;
          display: flex; flex-direction: column; gap: 14px;
        }

        input[type=range] {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px; outline: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 0 4px rgba(239,68,68,0.2), 0 2px 8px rgba(239,68,68,0.4);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 6px rgba(239,68,68,0.25), 0 2px 12px rgba(239,68,68,0.5);
        }

        .analyze-btn {
          width: 100%; padding: 18px;
          border-radius: 16px; border: none;
          background: linear-gradient(135deg, #b91c1c, #ef4444);
          color: white; font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700; letter-spacing: 0.02em;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 8px 32px rgba(239,68,68,0.3);
          opacity: 0; transform: translateY(20px);
        }
        .analyze-btn.mounted { opacity: 1; transform: translateY(0); }
        .analyze-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(239,68,68,0.4); }
        .analyze-btn:active:not(:disabled) { transform: scale(0.98); }
        .analyze-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .analyze-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%); transition: transform 0.5s;
        }
        .analyze-btn:hover::after { transform: translateX(100%); }

        .spinner {
          display: inline-block; width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .result-section {
          display: flex; flex-direction: column; gap: 14px;
          animation: slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .result-card {
          display: flex; flex-direction: column; align-items: center; gap: 20px;
          padding: 28px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(239,68,68,0.12);
          border-radius: 22px; position: relative; overflow: hidden;
        }
        .result-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.06), transparent);
        }

        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px; border-radius: 100px;
          font-size: 13px; font-weight: 500;
          animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }

        .factors-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 18px;
          animation: slideUp 0.5s ease 0.1s both;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #475569; text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 4px;
          animation: slideUp 0.4s ease both;
        }
        .tips-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 18px;
          animation: slideUp 0.5s ease 0.15s both;
        }
        .tip-row {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px; color: #64748b;
        }
        .tip-row:last-child { border-bottom: none; }
        
        .bp-card-inner {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
        }
        .bp-col { display: flex; flex-direction: column; gap: 8px; }
        .bp-divider { width: 1px; background: rgba(255,255,255,0.06); margin: 0 16px; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .risk-score {
          display: flex; align-items: center; justify-content: center; gap: 16px;
          padding: 12px 0;
        }
        .risk-num {
          font-family: 'Syne', sans-serif;
          font-size: 48px; font-weight: 800; line-height: 1;
        }
        .risk-label { font-size: 12px; color: #475569; }
      `}</style>

      <div className="cardio-root">
        {/* Header */}
        <div className={`cardio-header ${mounted ? "mounted" : ""}`}>
          <div className="header-icon">❤️</div>
          <div>
            <div className="header-title">Risque Cardiovasculaire</div>
            <div className="header-sub">Bilan personnalisé · {getToday()}</div>
          </div>
        </div>

        <div className="cardio-content">
          {/* Age */}
          {card(80,
            <>
              {lbl("Âge")}
              <NumStepper label="Âge" value={age} onChange={setAge} unit="ans" min={15} max={120} accent="#ef4444" />
            </>
          )}

          {/* Body */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {card(140,
              <>
                {lbl("Poids")}
                <NumStepper label="Poids" value={weight} onChange={setWeight} unit="kg" min={30} max={300} accent="#ef4444" />
              </>
            )}
            {card(140,
              <>
                {lbl("Taille")}
                <NumStepper label="Taille" value={height} onChange={setHeight} unit="cm" min={100} max={250} accent="#ef4444" />
              </>
            )}
          </div>

          {/* BMI */}
          {card(200,
            <>
              {lbl("Indice de masse corporelle")}
              <BMIGauge bmi={bmi} />
            </>
          )}

          {/* Blood pressure */}
          {card(260,
            <>
              {lbl("Tension artérielle")}
              <BPDisplay systolic={systolic} diastolic={diastolic} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#334155", marginBottom: 6 }}>Systolique</div>
                  <NumStepper label="" value={systolic} onChange={setSystolic} unit="mmHg" min={70} max={250} step={1} accent="#ef4444" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#334155", marginBottom: 6 }}>Diastolique</div>
                  <NumStepper label="" value={diastolic} onChange={setDiastolic} unit="mmHg" min={40} max={150} step={1} accent="#ef4444" />
                </div>
              </div>
            </>
          )}

          {/* Smoking */}
          {card(320,
            <>
              {lbl("Tabagisme")}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {smokingOpts.map(o => segBtn(o.val, smoking, setSmoking, o))}
              </div>
            </>
          )}

          {/* Exercise */}
          {card(380,
            <>
              {lbl("Activité physique / semaine")}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {exerciseOpts.map(o => segBtn(o.val, exercise, setExercise, o))}
              </div>
            </>
          )}

          {/* CTA */}
          <button
            className={`analyze-btn ${mounted ? "mounted" : ""}`}
            style={{ transitionDelay: "450ms" }}
            onClick={analyze}
            disabled={analyzing}
          >
            {analyzing
              ? <><span className="spinner" />Analyse en cours…</>
              : "Évaluer mon risque cardiovasculaire →"
            }
          </button>

          {/* Result */}
          {result && !analyzing && (
            <div className="result-section">
              {/* Hero card */}
              <div className="result-card">
                <HeartRing status={result.status} />

                <div
                  className="status-badge"
                  style={{
                    background: statusConfig[result.status].bg,
                    border: `1px solid ${statusConfig[result.status].color}33`,
                    color: statusConfig[result.status].color,
                  }}
                >
                  <span className="status-dot" style={{ background: statusConfig[result.status].color }} />
                  {statusConfig[result.status].label}
                </div>

                <div className="risk-score">
                  <div style={{ textAlign: "center" }}>
                    <div className="risk-num" style={{ color: result.riskFactors >= 3 ? "#ef4444" : result.riskFactors >= 2 ? "#f59e0b" : "#22c55e" }}>
                      {result.riskFactors}
                    </div>
                    <div className="risk-label">facteur{result.riskFactors > 1 ? "s" : ""} de risque</div>
                  </div>
                  <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.08)" }} />
                  <div style={{ textAlign: "center" }}>
                    <div className="risk-num" style={{ fontSize: 32, color: "#94a3b8" }}>
                      {result.factors.filter(f => f.status === "good").length}
                    </div>
                    <div className="risk-label">facteur{result.factors.filter(f => f.status === "good").length > 1 ? "s" : ""} OK</div>
                  </div>
                </div>
              </div>

              {/* Factor breakdown */}
              <div className="factors-card">
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  📊 Détail des facteurs
                </div>
                {result.factors.map((f, i) => (
                  <FactorRow key={i} label={f.label} status={f.status} delay={i * 70} />
                ))}
              </div>

              {/* Tips */}
              {result.status !== "good" && (
                <>
                  <div className="tips-card">
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>🥗 Conseils alimentaires</div>
                    {[
                      ["🫒", "Adoptez un régime méditerranéen, riche en graisses saines"],
                      ["🧂", "Réduisez le sel et les graisses saturées au quotidien"],
                      ["🥦", "Augmentez la consommation de légumes verts et fibres"],
                    ].map(([icon, text], i) => (
                      <div key={i} className="tip-row">
                        <span>{icon}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="section-title">💊 Compléments suggérés</div>
                  <SuppCard name="Oméga-3" reason="Soutien cardiovasculaire et effet anti-inflammatoire reconnu." sources="Saumon, sardines, graines de lin" delay={80} />
                  <SuppCard name="Magnésium" reason="Régulation de la tension artérielle et du rythme cardiaque." sources="Amandes, épinards, chocolat noir" delay={150} />
                  <SuppCard name="Potassium" reason="Contrebalance l'effet du sodium sur la pression artérielle." sources="Banane, avocat, lentilles" delay={220} />
                  <SuppCard name="Antioxydants (C, E, resvératrol)" reason="Protection contre le stress oxydatif vasculaire." sources="Agrumes, noix, raisin rouge" delay={290} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}