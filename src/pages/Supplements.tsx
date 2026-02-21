import { useState, useMemo, useEffect } from "react";

// ─── Mock deps — replace with real imports ────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];
const getSleepEntries = () => [];
const getHydrationEntries = () => [];
const getCardioEntries = () => [];
const getLatestEntry = (arr) => arr[arr.length - 1] || null;
const getGoal = () => "";
const saveGoal = (g) => console.log("goal saved", g);

// ─── Data ─────────────────────────────────────────────────────────────────────
const goals = [
  { value: "weight_loss", label: "Perte de poids",      icon: "🔥", color: "#f97316" },
  { value: "muscle",      label: "Prise de muscle",     icon: "💪", color: "#8b5cf6" },
  { value: "energy",      label: "Énergie",             icon: "⚡", color: "#eab308" },
  { value: "recovery",    label: "Récupération",        icon: "🌿", color: "#22c55e" },
];

const priorityCfg = {
  high:   { label: "Priorité haute",   color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"   },
  medium: { label: "Priorité moyenne", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  low:    { label: "Priorité faible",  color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)"  },
};

// ─── Supplement card ──────────────────────────────────────────────────────────
const SuppCard = ({ name, reason, sources, priority, delay = 0, accentColor }) => {
  const cfg = priorityCfg[priority];
  const ac = accentColor || cfg.color;

  return (
    <div
      style={{
        borderRadius: 16,
        background: "rgba(255,255,255,0.035)",
        border: `1px solid rgba(255,255,255,0.07)`,
        overflow: "hidden",
        animation: `slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both`,
        transition: "background 0.2s, border-color 0.2s, transform 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${ac}0A`;
        e.currentTarget.style.borderColor = `${ac}25`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.035)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${ac}, ${ac}44)` }} />

      <div style={{ display: "flex", gap: 14, padding: "14px 16px" }}>
        {/* Icon bubble */}
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: `${ac}18`, border: `1px solid ${ac}30`,
          display: "grid", placeItems: "center", fontSize: 20,
        }}>
          💊
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <span style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 14, fontWeight: 700, color: "#e2e8f0",
            }}>{name}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
              padding: "2px 8px", borderRadius: 100, flexShrink: 0,
              background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
            }}>{cfg.label}</span>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.6 }}>{reason}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7 }}>
            <span style={{ fontSize: 12 }}>🌿</span>
            <span style={{ fontSize: 11, color: ac }}>{sources}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Goal button ──────────────────────────────────────────────────────────────
const GoalBtn = ({ value, label, icon, color, selected, onClick }) => (
  <button onClick={() => onClick(value)} style={{
    padding: "16px 12px", borderRadius: 14,
    border: `1px solid ${selected ? `${color}50` : "rgba(255,255,255,0.07)"}`,
    background: selected ? `${color}18` : "rgba(255,255,255,0.03)",
    color: selected ? color : "#64748b",
    cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    boxShadow: selected ? `0 0 24px ${color}18, inset 0 0 16px ${color}08` : "none",
    transform: selected ? "scale(1.03)" : "scale(1)",
    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
  }}>
    <span style={{ fontSize: 24 }}>{icon}</span>
    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1.2, textAlign: "center" }}>{label}</span>
    {selected && (
      <span style={{
        width: 20, height: 20, borderRadius: "50%",
        background: color, display: "grid", placeItems: "center",
        fontSize: 11, color: "white", fontWeight: 700,
        animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>✓</span>
    )}
  </button>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 16, padding: "40px 20px", textAlign: "center",
    animation: "fadeIn 0.5s ease both",
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: 20,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "grid", placeItems: "center", fontSize: 32,
    }}>💊</div>
    <div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>
        Aucune recommandation
      </div>
      <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, maxWidth: 260 }}>
        Sélectionnez un objectif et remplissez les modules pour obtenir des recommandations personnalisées.
      </div>
    </div>
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, label, count, accentColor }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 0 4px",
    animation: "fadeIn 0.4s ease both",
  }}>
    <span style={{ fontSize: 14 }}>{icon}</span>
    <span style={{
      fontFamily: "'Syne',sans-serif",
      fontSize: 11, fontWeight: 700, color: "#475569",
      textTransform: "uppercase", letterSpacing: "0.1em", flex: 1,
    }}>{label}</span>
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 10px",
      borderRadius: 100, background: `${accentColor}18`,
      border: `1px solid ${accentColor}30`, color: accentColor,
    }}>{count}</span>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SupplementsPage() {
  const [selectedGoal, setSelectedGoal] = useState(getGoal() || "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleGoal = (g) => {
    setSelectedGoal(g);
    saveGoal(g);
  };

  const supplements = useMemo(() => {
    const sleep     = getLatestEntry(getSleepEntries());
    const hydration = getLatestEntry(getHydrationEntries());
    const cardio    = getLatestEntry(getCardioEntries());
    const list = [];

    if (sleep && sleep.status !== "good") {
      list.push({ name: "Magnésium glycinate", reason: "Améliore la détente musculaire et la qualité du sommeil.", sources: "Amandes, épinards, chocolat noir", priority: "high", source: "sleep" });
      list.push({ name: "L-théanine",          reason: "Favorise la relaxation sans somnolence.",                sources: "Thé vert",                            priority: "medium", source: "sleep" });
    }
    if (hydration && hydration.status !== "good") {
      list.push({ name: "Potassium", reason: "Maintient l'équilibre hydrique et électrolytique.", sources: "Banane, avocat, lentilles", priority: "high", source: "hydration" });
    }
    if (cardio && cardio.status !== "good") {
      list.push({ name: "Oméga-3",      reason: "Soutien cardiovasculaire et effet anti-inflammatoire.", sources: "Saumon, sardines, graines de lin", priority: "high",   source: "cardio" });
      list.push({ name: "Antioxydants", reason: "Protection contre le stress oxydatif vasculaire.",      sources: "Agrumes, raisin rouge, noix",       priority: "medium", source: "cardio" });
    }

    if (selectedGoal === "weight_loss") {
      list.push({ name: "L-carnitine", reason: "Aide à la mobilisation et l'oxydation des graisses.", sources: "Viande rouge, avocat",       priority: "medium", source: "goal" });
      list.push({ name: "Chrome",      reason: "Régule la glycémie et réduit les envies de sucre.",   sources: "Brocoli, raisin, champignon", priority: "low",    source: "goal" });
    }
    if (selectedGoal === "muscle") {
      list.push({ name: "Créatine",       reason: "Améliore la force explosive et la récupération musculaire.", sources: "Viande, poisson",           priority: "high", source: "goal" });
      list.push({ name: "Whey protéine",  reason: "Apport protéique rapide pour la synthèse musculaire.",        sources: "Lait, œufs, légumineuses", priority: "high", source: "goal" });
    }
    if (selectedGoal === "energy") {
      list.push({ name: "Fer",           reason: "Combat la fatigue liée à une anémie ferriprive.",    sources: "Lentilles, viande rouge, épinards", priority: "high",   source: "goal" });
      list.push({ name: "Vitamine B12",  reason: "Essentielle pour le métabolisme énergétique.",      sources: "Viande, poisson, œufs",             priority: "medium", source: "goal" });
      list.push({ name: "Coenzyme Q10", reason: "Soutient la production d'énergie au niveau cellulaire.", sources: "Sardines, bœuf, cacahuètes",     priority: "low",    source: "goal" });
    }
    if (selectedGoal === "recovery") {
      list.push({ name: "BCAA",       reason: "Acides aminés branchés pour la récupération musculaire.", sources: "Viande, produits laitiers", priority: "high",   source: "goal" });
      list.push({ name: "Vitamine D", reason: "Soutient le système immunitaire et la récupération.",     sources: "Soleil, poissons gras",     priority: "medium", source: "goal" });
      list.push({ name: "Zinc",       reason: "Aide à la réparation cellulaire et à l'immunité.",        sources: "Huîtres, graines de courge", priority: "medium", source: "goal" });
    }

    const seen = new Set();
    return list.filter(s => {
      if (seen.has(s.name)) return false;
      seen.add(s.name); return true;
    });
  }, [selectedGoal]);

  const goalColor = goals.find(g => g.value === selectedGoal)?.color || "#a855f7";
  const moduleSupps = supplements.filter(s => s.source !== "goal");
  const goalSupps   = supplements.filter(s => s.source === "goal");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080d14; }

        .supp-root {
          min-height: 100vh;
          background: #080d14;
          background-image:
            radial-gradient(ellipse 60% 40% at 50% -10%, rgba(168,85,247,0.1) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 85% 75%, rgba(168,85,247,0.06) 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          padding: 0 0 60px;
          overflow-x: hidden;
        }

        .supp-header {
          position: sticky; top: 0; z-index: 50;
          padding: 18px 20px 16px;
          background: rgba(8,13,20,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(168,85,247,0.08);
          display: flex; align-items: center; gap: 12px;
          opacity: 0; transform: translateY(-16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .supp-header.mounted { opacity: 1; transform: translateY(0); }

        .header-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(168,85,247,0.15);
          border: 1px solid rgba(168,85,247,0.25);
          display: grid; place-items: center; font-size: 18px;
          animation: floatPill 3s ease-in-out infinite;
        }
        @keyframes floatPill {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-3px) rotate(8deg); }
          66% { transform: translateY(1px) rotate(-4deg); }
        }

        .header-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700; letter-spacing: -0.3px; color: #f0f9ff;
        }
        .header-sub { font-size: 11px; color: #64748b; margin-top: 1px; }

        .supp-content {
          max-width: 420px; margin: 0 auto;
          padding: 28px 20px 0;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* Goal selector card */
        .goal-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 18px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease 80ms, transform 0.5s ease 80ms;
        }
        .goal-card.mounted { opacity: 1; transform: translateY(0); }
        .card-label {
          font-size: 11px; color: #475569;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;
        }
        .goal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* Stats row */
        .stats-row {
          display: flex; gap: 10px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease 160ms, transform 0.5s ease 160ms;
        }
        .stats-row.mounted { opacity: 1; transform: translateY(0); }
        .stat-chip {
          flex: 1; padding: 14px 12px; border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column; align-items: center; gap: 4;
        }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800; line-height: 1;
        }
        .stat-lbl { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.07em; }

        /* Results area */
        .results-area {
          display: flex; flex-direction: column; gap: 14px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease 240ms, transform 0.5s ease 240ms;
        }
        .results-area.mounted { opacity: 1; transform: translateY(0); }

        /* Warning banner */
        .warning-banner {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px; border-radius: 14px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.2);
          animation: fadeIn 0.5s ease 0.3s both;
        }
        .warning-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3);
          display: grid; placeItems: center; font-size: 16px; flexShrink: 0;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }

        .divider {
          height: 1px; background: rgba(255,255,255,0.05); margin: 4px 0;
        }
      `}</style>

      <div className="supp-root">
        {/* Header */}
        <div className={`supp-header ${mounted ? "mounted" : ""}`}>
          <div className="header-icon">💊</div>
          <div>
            <div className="header-title">Compléments Personnalisés</div>
            <div className="header-sub">Recommandations adaptées · {getToday()}</div>
          </div>
        </div>

        <div className="supp-content">
          {/* Goal selector */}
          <div className={`goal-card ${mounted ? "mounted" : ""}`}>
            <div className="card-label">Votre objectif principal</div>
            <div className="goal-grid">
              {goals.map(g => (
                <GoalBtn
                  key={g.value}
                  {...g}
                  selected={selectedGoal === g.value}
                  onClick={handleGoal}
                />
              ))}
            </div>
          </div>

          {/* Stats chips */}
          {supplements.length > 0 && (
            <div className={`stats-row ${mounted ? "mounted" : ""}`}>
              <div className="stat-chip">
                <div className="stat-num" style={{ color: goalColor }}>{supplements.length}</div>
                <div className="stat-lbl">Compléments</div>
              </div>
              <div className="stat-chip">
                <div className="stat-num" style={{ color: "#ef4444" }}>
                  {supplements.filter(s => s.priority === "high").length}
                </div>
                <div className="stat-lbl">Priorité haute</div>
              </div>
              <div className="stat-chip">
                <div className="stat-num" style={{ color: "#f59e0b" }}>
                  {supplements.filter(s => s.priority === "medium").length}
                </div>
                <div className="stat-lbl">Priorité moy.</div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className={`results-area ${mounted ? "mounted" : ""}`}>
            {supplements.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Module-based */}
                {moduleSupps.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <SectionHeader icon="📊" label="Basé sur vos bilans" count={moduleSupps.length} accentColor="#64748b" />
                    {moduleSupps.map((s, i) => (
                      <SuppCard key={s.name} {...s} delay={i * 70} accentColor={
                        s.source === "sleep" ? "#8b5cf6" : s.source === "hydration" ? "#22d3ee" : "#ef4444"
                      } />
                    ))}
                  </div>
                )}

                {moduleSupps.length > 0 && goalSupps.length > 0 && <div className="divider" />}

                {/* Goal-based */}
                {goalSupps.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <SectionHeader
                      icon={goals.find(g => g.value === selectedGoal)?.icon || "🎯"}
                      label={`Objectif : ${goals.find(g => g.value === selectedGoal)?.label || ""}`}
                      count={goalSupps.length}
                      accentColor={goalColor}
                    />
                    {goalSupps.map((s, i) => (
                      <SuppCard key={s.name} {...s} delay={i * 70 + moduleSupps.length * 70} accentColor={goalColor} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Warning */}
            <div className="warning-banner">
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
                display: "grid", placeItems: "center", fontSize: 16,
              }}>⚠️</div>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>
                  Avis médical recommandé
                </div>
                <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                  Consultez un professionnel de santé avant de commencer toute supplémentation. Ces recommandations sont indicatives.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}