import { useState, useEffect } from "react";

// ─── Mock deps — replace with real imports ────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];
const saveSleepEntry = (e) => console.log("saved", e);

// ─── Sleep arc visualization ──────────────────────────────────────────────────
const SleepArc = ({ duration, status }) => {
  const colors = { good: "#818cf8", warning: "#f59e0b", danger: "#ef4444" };
  const color = colors[status] || "#818cf8";
  const max = 10;
  const pct = Math.min(duration / max, 1);
  const r = 80;
  const cx = 110; const cy = 110;
  const startAngle = -210;
  const sweep = 240;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcPath = (a1, a2) => {
    const x1 = cx + r * Math.cos(toRad(a1));
    const y1 = cy + r * Math.sin(toRad(a1));
    const x2 = cx + r * Math.cos(toRad(a2));
    const y2 = cy + r * Math.sin(toRad(a2));
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const endAngle = startAngle + sweep * pct;

  return (
    <div style={{ position: "relative", width: 220, height: 180 }}>
      <svg viewBox="0 0 220 180" style={{ width: 220, height: 180 }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <path d={arcPath(startAngle, startAngle + sweep)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
        {/* Fill */}
        {pct > 0 && (
          <path
            d={arcPath(startAngle, endAngle)}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#arcGlow)"
            style={{ animation: "arcDraw 1.2s cubic-bezier(0.34,1.56,0.64,1) both" }}
          />
        )}
        {/* Stars */}
        {[[40,30],[170,25],[30,100],[190,90],[100,15]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={1.2} fill="white" opacity="0.3"
            style={{ animation: `twinkle 2s ease ${i * 0.4}s infinite` }} />
        ))}
      </svg>
      {/* Center text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        paddingBottom: 24,
      }}>
        <div style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 42, fontWeight: 800, lineHeight: 1,
          color: color,
          filter: `drop-shadow(0 0 16px ${color}88)`,
          animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both",
        }}>{duration}<span style={{ fontSize: 20, fontWeight: 500, marginLeft: 2 }}>h</span></div>
        <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>
          de sommeil
        </div>
      </div>
      <style>{`
        @keyframes arcDraw {
          from { stroke-dasharray: 0 1000; }
          to { stroke-dasharray: 1000 0; }
        }
        @keyframes twinkle {
          0%,100%{opacity:0.3;transform:scale(1)}
          50%{opacity:1;transform:scale(1.8)}
        }
        @keyframes popIn {
          from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)}
        }
      `}</style>
    </div>
  );
};

// ─── Time picker card ─────────────────────────────────────────────────────────
const TimeCard = ({ label, value, onChange, icon, delay, mounted }) => (
  <div style={{
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18, padding: 18,
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(129,140,248,0.2)"; e.currentTarget.style.background = "rgba(129,140,248,0.04)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.035)"; }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "12px 14px",
        borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        color: "#e2e8f0", fontSize: 22,
        fontFamily: "'Syne',sans-serif", fontWeight: 700,
        outline: "none", cursor: "pointer",
        letterSpacing: "0.05em",
      }}
    />
  </div>
);

// ─── Tip row ──────────────────────────────────────────────────────────────────
const TipRow = ({ text, delay }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
    fontSize: 13, color: "#64748b",
    animation: `slideIn 0.4s ease ${delay}ms both`,
  }}>
    <span style={{ fontSize: 15, flexShrink: 0 }}>{text.slice(0, 2)}</span>
    <span>{text.slice(2).trim()}</span>
  </div>
);

// ─── Supplement pill ──────────────────────────────────────────────────────────
const SuppPill = ({ name, reason, sources, delay }) => (
  <div style={{
    display: "flex", gap: 12, padding: "14px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    animation: `slideUp 0.5s ease ${delay}ms both`,
    transition: "background 0.2s, border-color 0.2s, transform 0.2s",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "rgba(129,140,248,0.06)"; e.currentTarget.style.borderColor = "rgba(129,140,248,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 11, flexShrink: 0,
      background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.25)",
      display: "grid", placeItems: "center", fontSize: 18,
    }}>💊</div>
    <div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{name}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.6 }}>{reason}</div>
      {sources && <div style={{ fontSize: 11, color: "#818cf8", marginTop: 4 }}>🌿 {sources}</div>}
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SleepPage() {
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [wakeUps, setWakeUps] = useState(0);
  const [fatigue, setFatigue] = useState("low");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const calcDuration = () => {
    const [bh, bm] = bedtime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return Math.round((mins / 60) * 10) / 10;
  };

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const duration = calcDuration();
      let status = "good";
      if (duration < 6) status = "danger";
      else if (duration < 7 || wakeUps >= 2 || fatigue === "high") status = "warning";
      const entry = { date: getToday(), bedtime, wakeTime, duration, wakeUps, fatigue, status };
      saveSleepEntry(entry);
      setResult(entry);
      setAnalyzing(false);
    }, 900);
  };

  const statusConfig = {
    good:    { label: "Sommeil de qualité",       color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
    warning: { label: "Sommeil à améliorer",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
    danger:  { label: "Sommeil insuffisant",      color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  };

  const tips = {
    danger: [
      "🛏️ Essayez de vous coucher 1h plus tôt ce soir",
      "📵 Évitez les écrans 30 min avant le coucher",
      "🍽️ Dînez léger 2–3h avant de dormir",
      "🧘 Pratiquez des exercices de respiration",
    ],
    warning: [
      "📵 Réduisez le temps d'écran le soir",
      "🌡️ Maintenez la chambre à 18–20°C",
      "🧘 Essayez la méditation ou la respiration profonde",
    ],
    good: [
      "✅ Votre sommeil est de qualité, continuez ainsi !",
      "🌙 Gardez des horaires réguliers pour ancrer votre rythme",
    ],
  };

  const fatigueOpts = [
    { val: "low",    label: "Reposé",  icon: "😊" },
    { val: "medium", label: "Moyen",   icon: "😐" },
    { val: "high",   label: "Épuisé",  icon: "😴" },
  ];

  const previewDuration = calcDuration();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080d14; }

        .sleep-root {
          min-height: 100vh;
          background: #080d14;
          background-image:
            radial-gradient(ellipse 70% 45% at 50% -5%, rgba(99,102,241,0.14) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 15% 80%, rgba(129,140,248,0.06) 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          padding: 0 0 60px;
          overflow-x: hidden;
        }

        .sleep-header {
          position: sticky; top: 0; z-index: 50;
          padding: 18px 20px 16px;
          background: rgba(8,13,20,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(129,140,248,0.08);
          display: flex; align-items: center; gap: 12px;
          display: flex; flex-direction: column; align-items: center;
          opacity: 0; transform: translateY(-16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .sleep-header.mounted { opacity: 1; transform: translateY(0); }

        .header-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(129,140,248,0.15);
          border: 1px solid rgba(129,140,248,0.25);
          display: grid; place-items: center; font-size: 18px;
          animation: moonFloat 4s ease-in-out infinite;
        }
        @keyframes moonFloat {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-4px) rotate(5deg); }
        }

        .header-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700; letter-spacing: -0.3px; color: #f0f9ff;
        }
        .header-sub { font-size: 11px; color: #64748b; margin-top: 1px; }

        .sleep-content {
          max-width: 420px; margin: 0 auto;
          padding: 28px 20px 0;
          display: flex; flex-direction: column; gap: 14px;
        }

        /* Preview duration bar */
        .preview-bar {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px 16px; border-radius: 14px;
          background: rgba(129,140,248,0.07);
          border: 1px solid rgba(129,140,248,0.12);
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease 80ms, transform 0.5s ease 80ms;
          font-size: 13px; color: #64748b;
        }
        .preview-bar.mounted { opacity: 1; transform: translateY(0); }
        .preview-num {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 800; color: #818cf8;
        }

        /* Card base */
        .card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 18px;
        }
        .card-label {
          font-size: 11px; color: #475569;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;
        }

        /* Slider */
        input[type=range] {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px; outline: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #818cf8;
          box-shadow: 0 0 0 4px rgba(129,140,248,0.2), 0 2px 8px rgba(129,140,248,0.4);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 6px rgba(129,140,248,0.25), 0 2px 12px rgba(129,140,248,0.5);
        }

        /* Seg buttons */
        .seg-btn {
          padding: 12px 6px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: #64748b; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          display: flex; flex-direction: column; align-items: center; gap: 4;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .seg-btn:hover { background: rgba(129,140,248,0.07); color: #94a3b8; border-color: rgba(129,140,248,0.2); }
        .seg-btn.active {
          background: rgba(129,140,248,0.15);
          border-color: rgba(129,140,248,0.4);
          color: #818cf8;
          box-shadow: 0 0 20px rgba(129,140,248,0.12), inset 0 0 12px rgba(129,140,248,0.05);
          transform: scale(1.03);
        }

        /* Analyze button */
        .analyze-btn {
          width: 100%; padding: 18px;
          border-radius: 16px; border: none;
          background: linear-gradient(135deg, #4f46e5, #818cf8);
          color: white; font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700; letter-spacing: 0.02em;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 8px 32px rgba(129,140,248,0.3);
          opacity: 0; transform: translateY(20px);
        }
        .analyze-btn.mounted { opacity: 1; transform: translateY(0); }
        .analyze-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(129,140,248,0.4); }
        .analyze-btn:active:not(:disabled) { transform: scale(0.98); }
        .analyze-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .analyze-btn::after {
          content: ''; position: absolute; inset: 0;
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

        /* Result */
        .result-section {
          display: flex; flex-direction: column; gap: 14px;
          animation: slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

        .result-hero {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          padding: 24px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(129,140,248,0.1);
          border-radius: 22px; position: relative; overflow: hidden;
        }
        .result-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.08), transparent);
        }

        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px; border-radius: 100px;
          font-size: 13px; font-weight: 500;
          animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
        }
        @keyframes popIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.4)} }

        /* Mini stats */
        .mini-stats { display: flex; gap: 0; width: 100%; }
        .mini-stat { flex: 1; text-align: center; }
        .mini-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800; color: #94a3b8;
        }
        .mini-stat-lbl { font-size: 10px; color: #334155; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 2px; }
        .mini-divider { width: 1px; background: rgba(255,255,255,0.06); }

        .tips-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 18px;
          animation: slideUp 0.5s ease 0.1s both;
        }
        .tips-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700; color: #94a3b8; margin-bottom: 8px;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          color: #475569; text-transform: uppercase; letter-spacing: 0.1em;
          animation: slideUp 0.4s ease both;
        }

        /* Time grid */
        .time-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      `}</style>

      <div className="sleep-root">
        {/* Header */}
        <div className={`sleep-header ${mounted ? "mounted" : ""}`}>
  {/* Logo centré */}
  <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: 10 }}>
    <img src="/logo.png" alt="SantéCare" style={{ height: 40, width: "auto", objectFit: "contain", filter: "drop-shadow(0 0 10px rgba(129,140,248,0.3))" }} />
  </div>
  {/* Titre module */}
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div className="header-icon">🌙</div>
    <div>
      <div className="header-title">Analyse du Sommeil</div>
      <div className="header-sub">Bilan personnalisé · {getToday()}</div>
    </div>
  </div>
</div>

        <div className="sleep-content">
          {/* Live duration preview */}
          <div className={`preview-bar ${mounted ? "mounted" : ""}`}>
            <span>🌙</span>
            <span>{bedtime}</span>
            <span style={{ color: "#334155" }}>→</span>
            <span>☀️</span>
            <span>{wakeTime}</span>
            <span style={{ color: "#334155", margin: "0 4px" }}>·</span>
            <span className="preview-num">{previewDuration}h</span>
            <span style={{ color: "#334155" }}>de sommeil</span>
          </div>

          {/* Time pickers */}
          <div className="time-grid">
            <TimeCard label="Coucher" value={bedtime} onChange={setBedtime} icon="🌙" delay={120} mounted={mounted} />
            <TimeCard label="Réveil" value={wakeTime} onChange={setWakeTime} icon="☀️" delay={180} mounted={mounted} />
          </div>

          {/* Wake ups */}
          <div style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18, padding: 18,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s ease 240ms, transform 0.5s ease 240ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(129,140,248,0.2)"; e.currentTarget.style.background = "rgba(129,140,248,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.035)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div className="card-label" style={{ marginBottom: 0 }}>Réveils nocturnes</div>
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: wakeUps >= 3 ? "#ef4444" : wakeUps >= 1 ? "#f59e0b" : "#818cf8" }}>
                {wakeUps}
              </span>
            </div>
            <input type="range" min={0} max={10} value={wakeUps} onChange={e => setWakeUps(Number(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].filter((_, i) => i % 2 === 0).map(v => (
                <span key={v} style={{ fontSize: 10, color: "#334155" }}>{v}</span>
              ))}
            </div>
          </div>

          {/* Fatigue */}
          <div style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18, padding: 18,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s ease 300ms, transform 0.5s ease 300ms",
          }}>
            <div className="card-label">Fatigue au réveil</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {fatigueOpts.map(({ val, label, icon }) => (
                <button key={val} className={`seg-btn ${fatigue === val ? "active" : ""}`} onClick={() => setFatigue(val)}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            className={`analyze-btn ${mounted ? "mounted" : ""}`}
            style={{ transitionDelay: "380ms" }}
            onClick={analyze}
            disabled={analyzing}
          >
            {analyzing
              ? <><span className="spinner" />Analyse en cours…</>
              : "Analyser mon sommeil →"
            }
          </button>

          {/* Result */}
          {result && !analyzing && (
            <div className="result-section">
              {/* Hero */}
              <div className="result-hero">
                <SleepArc duration={result.duration} status={result.status} />

                <div className="mini-stats">
                  <div className="mini-stat">
                    <div className="mini-stat-num">{result.bedtime}</div>
                    <div className="mini-stat-lbl">Coucher</div>
                  </div>
                  <div className="mini-divider" />
                  <div className="mini-stat">
                    <div className="mini-stat-num" style={{ color: result.wakeUps >= 3 ? "#ef4444" : result.wakeUps >= 1 ? "#f59e0b" : "#818cf8" }}>
                      {result.wakeUps}×
                    </div>
                    <div className="mini-stat-lbl">Réveils</div>
                  </div>
                  <div className="mini-divider" />
                  <div className="mini-stat">
                    <div className="mini-stat-num">{result.wakeTime}</div>
                    <div className="mini-stat-lbl">Réveil</div>
                  </div>
                </div>

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
              </div>

              {/* Tips */}
              <div className="tips-card">
                <div className="tips-title">
                  {result.status === "good" ? "✨" : "💡"} Conseils personnalisés
                </div>
                {tips[result.status].map((tip, i) => (
                  <TipRow key={i} text={tip} delay={i * 80} />
                ))}
              </div>

              {/* Supplements */}
              {result.status !== "good" && (
                <>
                  <div className="section-title">💊 Compléments suggérés</div>
                  <SuppPill name="Magnésium glycinate" reason="Améliore la détente musculaire et favorise l'endormissement profond." sources="Amandes, épinards, chocolat noir" delay={80} />
                  <SuppPill name="L-théanine" reason="Favorise la relaxation et la qualité du sommeil sans somnolence." sources="Thé vert" delay={150} />
                  <SuppPill name="Mélatonine" reason="Usage ponctuel uniquement — aide à réguler le cycle circadien." sources={null} delay={220} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// statusConfig used inside JSX — declare after component def for clarity
const statusConfig = {
  good:    { label: "Sommeil de qualité",  color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  warning: { label: "Sommeil à améliorer", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  danger:  { label: "Sommeil insuffisant", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};