import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Droplets, Heart, Pill, UtensilsCrossed, Activity, TrendingUp, ChevronRight, Zap } from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import {
  getSleepEntries, getHydrationEntries, getCardioEntries,
  getLatestEntry, getTodayEntries, getLast7DaysEntries,
} from "@/lib/storage";

// ─── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  bg:      "#080c14",
  card:    "rgba(255,255,255,0.03)",
  border:  "rgba(255,255,255,0.07)",
  text:    "#ffffff",
  muted:   "#475569",
  dimmed:  "#1e293b",
  green:   "#22c55e",
  amber:   "#f59e0b",
  red:     "#ef4444",
  blue:    "#3b82f6",
  purple:  "#a855f7",
  cyan:    "#22d3ee",
};

const MODULE_META = [
  { path: "/sleep",       label: "Sommeil",     icon: Moon,           accent: "#818cf8", glyph: "💤" },
  { path: "/hydration",   label: "Hydratation", icon: Droplets,       accent: "#22d3ee", glyph: "💧" },
  { path: "/cardio",      label: "Cœur",        icon: Heart,          accent: "#f43f5e", glyph: "❤️" },
  { path: "/supplements", label: "Compléments", icon: Pill,           accent: "#a855f7", glyph: "💊" },
  { path: "/food",        label: "Aliments",    icon: UtensilsCrossed,accent: "#22c55e", glyph: "🥗" },
];

// ─── Status helpers ─────────────────────────────────────────────────────────────
const statusColor = (s?: string) =>
  !s ? C.muted : s === "good" ? C.green : s === "warning" ? C.amber : C.red;
const statusLabel = (s?: string) =>
  !s ? "Non renseigné" : s === "good" ? "Optimal" : s === "warning" ? "À améliorer" : "Attention";

// ─── Mini sparkline ─────────────────────────────────────────────────────────────
const Sparkline = ({ data, max, color }: { data: number[]; max: number; color: string }) => {
  if (!data.length) return (
    <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 11, color: C.muted }}>Aucune donnée</span>
    </div>
  );
  const h = 44;
  const w = 8;
  const gap = 4;
  return (
    <svg viewBox={`0 0 ${data.length * (w + gap)} ${h}`} style={{ width: "100%", height: h }}>
      {data.map((v, i) => {
        const barH = Math.max(4, (v / max) * h);
        return (
          <motion.rect
            key={i}
            x={i * (w + gap)}
            y={h - barH}
            width={w}
            height={barH}
            rx={3}
            fill={color}
            fillOpacity={0.6 + (i / data.length) * 0.4}
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: `${i * (w + gap) + w / 2}px ${h}px` }}
          />
        );
      })}
    </svg>
  );
};

// ─── Stat ring ──────────────────────────────────────────────────────────────────
const StatRing = ({ value, max, color, size = 56 }: { value: number; max: number; color: string; size?: number }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / Math.max(max, 1), 1);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
      />
    </svg>
  );
};

// ─── Module card (top 3) ────────────────────────────────────────────────────────
const StatusCard = ({ mod, value, status, index }: {
  mod: typeof MODULE_META[0]; value: string; status?: string; index: number;
}) => {
  const navigate = useNavigate();
  const color = statusColor(status);
  return (
    <motion.button
      onClick={() => navigate(mod.path)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 260, damping: 22 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      style={{
        flex: 1, padding: "16px 12px", borderRadius: 20,
        background: `linear-gradient(160deg, ${mod.accent}10, ${mod.accent}05)`,
        border: `1px solid ${mod.accent}20`,
        cursor: "pointer", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Glow bg */}
      <div style={{
        position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
        width: 80, height: 80,
        background: `radial-gradient(circle, ${mod.accent}20, transparent 70%)`,
        pointerEvents: "none",
      }}/>
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: `${mod.accent}18`, border: `1px solid ${mod.accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <mod.icon size={20} style={{ color: mod.accent }} />
        {/* Status dot */}
        <div style={{
          position: "absolute", top: -3, right: -3,
          width: 10, height: 10, borderRadius: "50%",
          background: color,
          border: "2px solid #080c14",
          boxShadow: `0 0 6px ${color}`,
        }}/>
      </div>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em" }}>
        {mod.label.toUpperCase()}
      </span>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: value === "—" ? C.muted : C.text }}>
        {value}
      </span>
      <span style={{ fontSize: 10, color, fontWeight: 600 }}>{statusLabel(status)}</span>
    </motion.button>
  );
};

// ─── Quick access row ───────────────────────────────────────────────────────────
const QuickRow = ({ mod, value, status, index }: {
  mod: typeof MODULE_META[0]; value?: string; status?: string; index: number;
}) => {
  const navigate = useNavigate();
  const color = statusColor(status);
  return (
    <motion.button
      onClick={() => navigate(mod.path)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + index * 0.07, type: "spring", stiffness: 240, damping: 24 }}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.99 }}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px", borderRadius: 18,
        background: C.card, border: `1px solid ${C.border}`,
        cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: "20%", bottom: "20%",
        width: 3, borderRadius: "0 3px 3px 0",
        background: mod.accent,
        boxShadow: `0 0 8px ${mod.accent}`,
      }}/>

      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        background: `${mod.accent}15`, border: `1px solid ${mod.accent}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <mod.icon size={20} style={{ color: mod.accent }}/>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>
          {mod.label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}` }}/>
          <span style={{ fontSize: 11, color: C.muted }}>{statusLabel(status)}</span>
          {value && <span style={{ fontSize: 11, color: "#64748b" }}>· {value}</span>}
        </div>
      </div>

      <ChevronRight size={16} style={{ color: C.muted, flexShrink: 0 }}/>
    </motion.button>
  );
};

// ─── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const sleepEntries     = useMemo(() => getSleepEntries(), []);
  const hydrationEntries = useMemo(() => getHydrationEntries(), []);
  const cardioEntries    = useMemo(() => getCardioEntries(), []);

  const latestSleep     = getLatestEntry(getTodayEntries(sleepEntries));
  const latestHydration = getLatestEntry(getTodayEntries(hydrationEntries));
  const latestCardio    = getLatestEntry(cardioEntries);

  const last7Sleep     = getLast7DaysEntries(sleepEntries);
  const last7Hydration = getLast7DaysEntries(hydrationEntries);

  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const modules = [
    { ...MODULE_META[0], status: latestSleep?.status,     value: latestSleep     ? `${latestSleep.duration}h`      : "—" },
    { ...MODULE_META[1], status: latestHydration?.status, value: latestHydration ? `${latestHydration.consumed}L`  : "—" },
    { ...MODULE_META[2], status: latestCardio?.status,    value: latestCardio    ? `${latestCardio.riskFactors} risques` : "—" },
    { ...MODULE_META[3], status: undefined, value: undefined },
    { ...MODULE_META[4], status: undefined, value: undefined },
  ];

  const filledCount = modules.filter(m => m.status).length;
  const healthPct = Math.round((filledCount / 3) * 100);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        @keyframes pulse-soft {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.6; transform:scale(0.95); }
        }
      `}</style>

      <DisclaimerBanner />

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ padding: "40px 20px 20px", maxWidth: 480, margin: "0 auto" }}
      >

        {/* Logo centré */}
<motion.div
  initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }}
  transition={{ duration:0.5,ease:[0.34,1.56,0.64,1] }}
  style={{ display:"flex",justifyContent:"center",marginBottom:20 }}
>
  <img
    src="/logo.png"
    alt="SantéCare"
    style={{ height:48,width:"auto",objectFit:"contain",
      filter:"drop-shadow(0 0 14px rgba(34,197,94,0.3))" }}
    onError={(e) => { (e.currentTarget as HTMLImageElement).src="/logo.png"; }}
  />
</motion.div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 16,
              background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))",
              border: "1px solid rgba(34,197,94,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(34,197,94,0.15)",
            }}>
              <Activity size={22} style={{ color: C.green }}/>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>
                Assistant Santé
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {timeGreet} · {dateStr}
              </div>
            </div>
          </div>

          {/* Global score */}
          <div style={{ position: "relative", width: 46, height: 46 }}>
            <StatRing value={filledCount} max={3} color={C.green} size={46}/>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 800, color: C.green }}>
                {healthPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Score bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          style={{ marginTop: 20, padding: "12px 16px", borderRadius: 14,
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <Zap size={14} style={{ color: C.green, flexShrink: 0 }}/>
          <span style={{ fontSize: 12, color: "#64748b", flex: 1 }}>Score de suivi</span>
          <div style={{ flex: 2, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthPct}%` }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${C.green}88, ${C.green})`,
                boxShadow: `0 0 8px ${C.green}66` }}
            />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 800, color: C.green, minWidth: 36, textAlign: "right" }}>
            {filledCount}/3
          </span>
        </motion.div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}
      >

        {/* ── Status overview (top 3) ── */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Bilan du jour
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {modules.slice(0, 3).map((m, i) => (
              <StatusCard key={m.path} mod={m} value={m.value || "—"} status={m.status} index={i}/>
            ))}
          </div>
        </div>

        {/* ── Charts ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Sommeil", sub: "7 derniers jours", data: last7Sleep.map(s => s.duration), max: 12, color: "#818cf8" },
            { label: "Hydratation", sub: "7 derniers jours", data: last7Hydration.map(h => h.consumed), max: 5, color: "#22d3ee" },
          ].map((chart, i) => (
            <motion.div
              key={chart.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{ padding: "14px 14px 10px", borderRadius: 18, background: C.card, border: `1px solid ${C.border}` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: chart.color, boxShadow: `0 0 6px ${chart.color}` }}/>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{chart.label}</span>
              </div>
              <Sparkline data={chart.data} max={chart.max} color={chart.color}/>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{chart.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Quick access ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <TrendingUp size={13} style={{ color: C.muted }}/>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Accès rapide
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {modules.map((m, i) => (
              <QuickRow key={m.path} mod={m} value={m.value} status={m.status} index={i}/>
            ))}
          </div>
        </div>

      </motion.main>
    </div>
  );
};

export default Dashboard;