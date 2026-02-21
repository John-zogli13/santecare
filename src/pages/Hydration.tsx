import { useState, useEffect, useRef } from "react";

// ─── Inline mock deps (replace with your real imports) ───────────────────────
const getToday = () => new Date().toISOString().split("T")[0];
const saveHydrationEntry = (e) => console.log("saved", e);

// ─── Animated water fill orb ─────────────────────────────────────────────────
const WaterOrb = ({ ratio }) => {
  const pct = Math.min(Math.max(ratio * 100, 0), 100);
  const color =
    pct >= 100 ? "#22d3ee" : pct >= 80 ? "#38bdf8" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="orb-wrapper">
      <svg viewBox="0 0 200 200" className="orb-svg">
        <defs>
          <clipPath id="circle-clip">
            <circle cx="100" cy="100" r="88" />
          </clipPath>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {/* Outer glow ring */}
        <circle cx="100" cy="100" r="96" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
        <circle cx="100" cy="100" r="88" fill="rgba(255,255,255,0.04)" />
        {/* Water fill */}
        <g clipPath="url(#circle-clip)">
          <rect x="0" y={200 - pct * 1.76} width="200" height="200" fill="url(#waveGrad)" className="water-fill" />
          {/* Wave 1 */}
          <path
            d={`M-40,${200 - pct * 1.76 - 8} 
               Q10,${200 - pct * 1.76 - 24} 60,${200 - pct * 1.76 - 8} 
               T160,${200 - pct * 1.76 - 8} 
               T260,${200 - pct * 1.76 - 8} V200 H-40Z`}
            fill={color}
            opacity="0.6"
            className="wave wave1"
          />
          {/* Wave 2 */}
          <path
            d={`M-60,${200 - pct * 1.76 - 4} 
               Q0,${200 - pct * 1.76 - 18} 60,${200 - pct * 1.76 - 4} 
               T180,${200 - pct * 1.76 - 4} 
               T300,${200 - pct * 1.76 - 4} V200 H-60Z`}
            fill={color}
            opacity="0.4"
            className="wave wave2"
          />
        </g>
        {/* Shine */}
        <ellipse cx="75" cy="65" rx="18" ry="10" fill="white" opacity="0.12" transform="rotate(-30 75 65)" />
      </svg>
      <style>{`
        .orb-svg { width: 200px; height: 200px; filter: drop-shadow(0 0 24px ${color}55); }
        .wave { transition: d 1s ease; }
        .wave1 { animation: waveAnim1 3s ease-in-out infinite; }
        .wave2 { animation: waveAnim2 4s ease-in-out infinite; }
        @keyframes waveAnim1 {
          0%,100% { transform: translateX(0); }
          50% { transform: translateX(-30px); }
        }
        @keyframes waveAnim2 {
          0%,100% { transform: translateX(0); }
          50% { transform: translateX(25px); }
        }
        .water-fill { transition: y 1.2s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>
    </div>
  );
};

// ─── Animated counter ─────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, decimals = 1 }) => {
  const [display, setDisplay] = useState(value);
  const ref = useRef(value);

  useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(+(start + (end - start) * eased).toFixed(decimals));
      if (progress < 1) requestAnimationFrame(tick);
      else ref.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <span>{display.toFixed(decimals)}</span>;
};

// ─── Supplement pill card ─────────────────────────────────────────────────────
const SupplementPill = ({ name, reason, sources, delay = 0 }) => (
  <div className="supp-pill" style={{ animationDelay: `${delay}ms` }}>
    <div className="supp-icon">💊</div>
    <div>
      <div className="supp-name">{name}</div>
      <div className="supp-reason">{reason}</div>
      <div className="supp-sources">🌿 {sources}</div>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HydrationPage() {
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState("sedentary");
  const [temperature, setTemperature] = useState("normal");
  const [consumed, setConsumed] = useState(1.5);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      let needed = weight * 0.033;
      if (activity === "moderate") needed += 0.5;
      if (activity === "intense") needed += 1;
      if (temperature === "hot") needed += 0.5;
      needed = Math.round(needed * 10) / 10;
      const ratio = consumed / needed;
      let status = "good";
      if (ratio < 0.8) status = "danger";
      else if (ratio < 1) status = "warning";
      const entry = { date: getToday(), weight, activity, temperature, consumed, needed, status };
      saveHydrationEntry(entry);
      setResult(entry);
      setAnalyzing(false);
    }, 900);
  };

  const ratio = result ? result.consumed / result.needed : 0;
  const statusConfig = {
    good:    { label: "Hydratation optimale",      color: "#22d3ee", bg: "rgba(34,211,238,0.12)" },
    warning: { label: "À améliorer",               color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
    danger:  { label: "Risque d'insuffisance",     color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  };

  const activityOpts = [
    { val: "sedentary", label: "Sédentaire", icon: "🛋️" },
    { val: "moderate",  label: "Modéré",     icon: "🚶" },
    { val: "intense",   label: "Intense",    icon: "🏃" },
  ];
  const tempOpts = [
    { val: "cold",   label: "Fraîche",  icon: "❄️", sub: "< 15°C" },
    { val: "normal", label: "Normale",  icon: "🌤️", sub: "15–25°C" },
    { val: "hot",    label: "Chaude",   icon: "☀️", sub: "> 25°C"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #080d14; }

        .hydro-root {
          min-height: 100vh;
          background: #080d14;
          background-image:
            radial-gradient(ellipse 60% 40% at 50% -10%, rgba(34,211,238,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(56,189,248,0.07) 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          padding: 0 0 60px;
          overflow-x: hidden;
        }

        /* Header */
        .hydro-header {
          position: sticky; top: 0; z-index: 50;
          padding: 18px 20px 16px;
          background: rgba(8,13,20,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(34,211,238,0.08);
          display: flex; align-items: center; gap: 12px;
          opacity: 0; transform: translateY(-16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .hydro-header.mounted { opacity: 1; transform: translateY(0); }
        .header-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(34,211,238,0.15);
          border: 1px solid rgba(34,211,238,0.25);
          display: grid; place-items: center; font-size: 18px;
        }
        .header-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700; letter-spacing: -0.3px;
          color: #f0f9ff;
        }
        .header-sub { font-size: 11px; color: #64748b; margin-top: 1px; }

        /* Content */
        .hydro-content {
          max-width: 420px; margin: 0 auto;
          padding: 28px 20px 0;
          display: flex; flex-direction: column; gap: 14px;
        }

        /* Cards */
        .card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 18px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease,
                      background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .card.mounted { opacity: 1; transform: translateY(0); }
        .card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(34,211,238,0.12);
          box-shadow: 0 0 32px rgba(34,211,238,0.04);
        }

        /* Label */
        .card-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: #475569; margin-bottom: 12px;
        }
        .card-value {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 700; color: #22d3ee;
        }

        /* Slider */
        .slider-row { display: flex; align-items: center; gap: 14px; }
        .slider-labels { display: flex; justify-content: space-between; margin-top: 8px; }
        .slider-label-txt { font-size: 10px; color: #334155; }

        input[type=range] {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px; outline: none; cursor: pointer;
          flex: 1;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 0 4px rgba(34,211,238,0.2), 0 2px 8px rgba(34,211,238,0.4);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 6px rgba(34,211,238,0.25), 0 2px 12px rgba(34,211,238,0.5);
        }

        /* Segment buttons */
        .seg-grid { display: grid; gap: 8px; }
        .seg-btn {
          padding: 12px 8px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: #64748b; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .seg-btn:hover { background: rgba(34,211,238,0.07); color: #94a3b8; border-color: rgba(34,211,238,0.15); }
        .seg-btn.active {
          background: rgba(34,211,238,0.15);
          border-color: rgba(34,211,238,0.4);
          color: #22d3ee;
          box-shadow: 0 0 20px rgba(34,211,238,0.12), inset 0 0 12px rgba(34,211,238,0.05);
          transform: scale(1.02);
        }
        .seg-icon { font-size: 18px; }
        .seg-sub { font-size: 10px; color: #334155; }
        .seg-btn.active .seg-sub { color: rgba(34,211,238,0.6); }

        /* Analyze button */
        .analyze-btn {
          width: 100%; padding: 18px;
          border-radius: 16px; border: none;
          background: linear-gradient(135deg, #0891b2, #22d3ee);
          color: white; font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700; letter-spacing: 0.02em;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 8px 32px rgba(34,211,238,0.3);
          opacity: 0; transform: translateY(20px);
        }
        .analyze-btn.mounted { opacity: 1; transform: translateY(0); }
        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(34,211,238,0.4);
        }
        .analyze-btn:active:not(:disabled) { transform: scale(0.98); }
        .analyze-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .analyze-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .analyze-btn:hover::after { transform: translateX(100%); }

        /* Spinner */
        .spinner {
          display: inline-block; width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Result section */
        .result-section {
          display: flex; flex-direction: column; gap: 14px;
          animation: slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Orb card */
        .orb-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 16px; padding: 28px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(34,211,238,0.1);
          border-radius: 22px;
          position: relative; overflow: hidden;
        }
        .orb-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,211,238,0.06), transparent);
        }
        .orb-wrapper { position: relative; z-index: 1; }

        .stat-row { display: flex; gap: 20px; width: 100%; justify-content: center; }
        .stat-block { text-align: center; }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800; line-height: 1;
        }
        .stat-unit { font-size: 14px; font-weight: 400; margin-left: 2px; }
        .stat-lbl { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 4px; }
        .stat-divider { width: 1px; background: rgba(255,255,255,0.08); }

        /* Status badge */
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
        .status-dot { width: 7px; height: 7px; border-radius: 50%; animation: pulse 2s ease infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }

        /* Tips card */
        .tips-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 18px;
          animation: slideUp 0.5s ease 0.15s both;
        }
        .tips-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700; color: #94a3b8; margin-bottom: 12px;
          display: flex; align-items: center; gap: 6px;
        }
        .tip-row {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px; color: #64748b;
          animation: fadeIn 0.4s ease both;
        }
        .tip-row:last-child { border-bottom: none; }
        @keyframes fadeIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

        /* Supplement pills */
        .supp-pill {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px; border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          animation: slideUp 0.5s ease both;
          transition: background 0.2s, border-color 0.2s;
        }
        .supp-pill:hover { background: rgba(34,211,238,0.05); border-color: rgba(34,211,238,0.12); }
        .supp-icon { font-size: 22px; margin-top: 2px; }
        .supp-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #e2e8f0; }
        .supp-reason { font-size: 12px; color: #64748b; margin-top: 2px; line-height: 1.5; }
        .supp-sources { font-size: 11px; color: #22d3ee; margin-top: 4px; }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #475569; text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 4px;
          animation: slideUp 0.4s ease both;
        }

        /* Progress bar under orb */
        .progress-track {
          width: 100%; height: 4px;
          background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;
        }
        .progress-fill {
          height: 100%; border-radius: 2px;
          transition: width 1.2s cubic-bezier(0.34,1.56,0.64,1);
        }
      `}</style>

      <div className="hydro-root">
        {/* Header */}
        <div className={`hydro-header ${mounted ? "mounted" : ""}`}>
          <div className="header-icon">💧</div>
          <div>
            <div className="header-title">Hydratation</div>
            <div className="header-sub">Analyse personnalisée · {getToday()}</div>
          </div>
        </div>

        <div className="hydro-content">
          {/* Weight */}
          <div className="card" style={{ transitionDelay: "80ms" , ...(mounted ? { opacity:1, transform:"translateY(0)" } : {}) }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <div className="card-label">Poids corporel</div>
              <div className="card-value">{weight} <span style={{ fontSize:14, fontWeight:400 }}>kg</span></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <input type="range" min={30} max={200} value={weight} onChange={e => setWeight(Number(e.target.value))} />
              <div className="slider-labels">
                <span className="slider-label-txt">30 kg</span>
                <span className="slider-label-txt">115 kg</span>
                <span className="slider-label-txt">200 kg</span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="card" style={{ transitionDelay: "150ms", ...(mounted ? { opacity:1, transform:"translateY(0)" } : {}) }}>
            <div className="card-label">Activité physique</div>
            <div className="seg-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {activityOpts.map(({ val, label, icon }) => (
                <button key={val} className={`seg-btn ${activity === val ? "active" : ""}`} onClick={() => setActivity(val)}>
                  <span className="seg-icon">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div className="card" style={{ transitionDelay: "220ms", ...(mounted ? { opacity:1, transform:"translateY(0)" } : {}) }}>
            <div className="card-label">Température extérieure</div>
            <div className="seg-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {tempOpts.map(({ val, label, icon, sub }) => (
                <button key={val} className={`seg-btn ${temperature === val ? "active" : ""}`} onClick={() => setTemperature(val)}>
                  <span className="seg-icon">{icon}</span>
                  {label}
                  <span className="seg-sub">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Water consumed */}
          <div className="card" style={{ transitionDelay: "290ms", ...(mounted ? { opacity:1, transform:"translateY(0)" } : {}) }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <div className="card-label">Eau consommée</div>
              <div className="card-value">{consumed} <span style={{ fontSize:14, fontWeight:400 }}>L</span></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <input type="range" min={0} max={5} step={0.25} value={consumed} onChange={e => setConsumed(Number(e.target.value))} />
              <div className="slider-labels">
                <span className="slider-label-txt">0 L</span>
                <span className="slider-label-txt">2.5 L</span>
                <span className="slider-label-txt">5 L</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            className={`analyze-btn ${mounted ? "mounted" : ""}`}
            style={{ transitionDelay: "360ms" }}
            onClick={analyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <><span className="spinner" />Analyse en cours…</>
            ) : "Analyser mon hydratation →"}
          </button>

          {/* Result */}
          {result && !analyzing && (
            <div className="result-section">
              {/* Orb + stats */}
              <div className="orb-card">
                <WaterOrb ratio={ratio} />

                <div className="stat-row">
                  <div className="stat-block">
                    <div className="stat-num" style={{ color: "#22d3ee" }}>
                      <AnimatedNumber value={result.consumed} />
                      <span className="stat-unit">L</span>
                    </div>
                    <div className="stat-lbl">Consommé</div>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-block">
                    <div className="stat-num" style={{ color: "#94a3b8" }}>
                      <AnimatedNumber value={result.needed} />
                      <span className="stat-unit">L</span>
                    </div>
                    <div className="stat-lbl">Recommandé</div>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-block">
                    <div className="stat-num" style={{ color: ratio >= 1 ? "#22d3ee" : ratio >= 0.8 ? "#f59e0b" : "#ef4444" }}>
                      <AnimatedNumber value={Math.round(ratio * 100)} decimals={0} />
                      <span className="stat-unit">%</span>
                    </div>
                    <div className="stat-lbl">Ratio</div>
                  </div>
                </div>

                <div className="progress-track" style={{ width: "90%" }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(ratio * 100, 100)}%`,
                      background: ratio >= 1 ? "linear-gradient(90deg,#0891b2,#22d3ee)"
                               : ratio >= 0.8 ? "linear-gradient(90deg,#d97706,#f59e0b)"
                               : "linear-gradient(90deg,#dc2626,#ef4444)"
                    }}
                  />
                </div>

                {result.status && (
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
                )}
              </div>

              {/* Tips + Supplements */}
              {result.status !== "good" && (
                <>
                  <div className="tips-card">
                    <div className="tips-title">💡 Conseils personnalisés</div>
                    {[
                      ["💧", "Buvez 1 à 2 verres d'eau supplémentaires dans la prochaine heure"],
                      ["🍋", "Ajoutez du citron ou du concombre pour varier les saveurs"],
                      ["⚡", "Pensez aux électrolytes naturels pour une meilleure absorption"],
                    ].map(([icon, text], i) => (
                      <div key={i} className="tip-row" style={{ animationDelay: `${i * 80}ms` }}>
                        <span>{icon}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="section-title" style={{ animationDelay: "100ms" }}>💊 Compléments suggérés</div>
                  <SupplementPill
                    name="Magnésium"
                    reason="Essentiel pour l'équilibre hydrique et la fonction musculaire."
                    sources="Amandes, chocolat noir, épinards"
                    delay={80}
                  />
                  <SupplementPill
                    name="Potassium"
                    reason="Aide à maintenir l'équilibre des fluides et la pression artérielle."
                    sources="Banane, avocat, pomme de terre"
                    delay={160}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}