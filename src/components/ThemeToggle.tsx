import { useState } from "react";
import { useTheme, type Theme } from "./ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

// ─── Mini toggle button for BottomNav or headers ──────────────────────────────
export const ThemeToggleButton = () => {
  const { theme, toggle, isDark } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      style={{
        width: 44, height: 26,
        borderRadius: 13,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        cursor: "pointer",
        padding: 3,
        display: "flex",
        alignItems: "center",
        position: "relative",
        transition: "background 0.3s, border-color 0.3s",
        flexShrink: 0,
      }}
    >
      {/* Track fill */}
      <div style={{
        position: "absolute", inset: 2,
        borderRadius: 11,
        background: isDark
          ? "linear-gradient(135deg, #4f46e5, #818cf8)"
          : "linear-gradient(135deg, #f59e0b, #fbbf24)",
        opacity: 0.2,
        transition: "opacity 0.3s",
      }}/>
      {/* Thumb */}
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        background: isDark
          ? "linear-gradient(135deg, #818cf8, #6366f1)"
          : "linear-gradient(135deg, #f59e0b, #f97316)",
        boxShadow: isDark
          ? "0 0 8px rgba(129,140,248,0.6)"
          : "0 0 8px rgba(245,158,11,0.6)",
        display: "grid", placeItems: "center",
        transform: isDark ? "translateX(0)" : "translateX(18px)",
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s, box-shadow 0.3s",
        position: "relative", zIndex: 1,
      }}>
        {isDark
          ? <Moon size={11} style={{ color: "white" }}/>
          : <Sun  size={11} style={{ color: "white" }}/>
        }
      </div>
    </button>
  );
};

// ─── Full theme selector panel (bottom sheet) ─────────────────────────────────
export const ThemePanel = ({ onClose }: { onClose: () => void }) => {
  const { theme, setTheme, isDark } = useTheme();

  const opts: { value: Theme; label: string; sub: string; Icon: any; color: string }[] = [
    { value: "dark",  label: "Mode sombre", sub: "Fond noir, yeux reposés", Icon: Moon,    color: "#818cf8" },
    { value: "light", label: "Mode clair",  sub: "Fond blanc, lisibilité maximale", Icon: Sun, color: "#f59e0b" },
  ];

  return (
    <>
      <style>{`
        @keyframes sheetUp {
          from { opacity:0; transform:translateY(40px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 110,
          background: "var(--overlay-bg)",
          backdropFilter: "blur(8px)",
          animation: "fadeIn 0.2s ease both",
        }}
      />
      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 111,
        display: "flex", justifyContent: "center",
        animation: "sheetUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <div style={{
          width: "100%", maxWidth: 480,
          background: isDark ? "rgba(12,18,28,0.98)" : "rgba(255,255,255,0.98)",
          border: `1px solid var(--border)`,
          borderBottom: "none",
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 40px",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.3)",
        }}>
          {/* Handle */}
          <div style={{ width:40, height:4, borderRadius:2, background:"var(--border)", margin:"0 auto 20px" }}/>

          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize:16, fontWeight:800,
            color:"var(--text-primary)", marginBottom:6,
          }}>Apparence</div>
          <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:20 }}>
            Choisissez le thème de l'application
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {opts.map(({ value, label, sub, Icon, color }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  onClick={() => { setTheme(value); onClose(); }}
                  style={{
                    display:"flex", alignItems:"center", gap:14,
                    padding:"16px 18px", borderRadius:16, border:"none",
                    background: active ? `${color}15` : "var(--bg-secondary)",
                    border: `1px solid ${active ? `${color}40` : "var(--border)"}`,
                    cursor:"pointer",
                    boxShadow: active ? `0 0 24px ${color}18` : "none",
                    transform: active ? "scale(1.02)" : "scale(1)",
                    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    width:"100%", textAlign:"left" as const,
                  }}
                >
                  {/* Icon bubble */}
                  <div style={{
                    width:46, height:46, borderRadius:14, flexShrink:0,
                    background: active ? `${color}20` : "var(--bg-card)",
                    border:`1px solid ${active ? `${color}35` : "var(--border)"}`,
                    display:"grid", placeItems:"center",
                    boxShadow: active ? `0 0 16px ${color}30` : "none",
                    transition:"all 0.25s",
                  }}>
                    <Icon size={20} style={{ color: active ? color : "var(--text-muted)", transition:"color 0.2s" }}/>
                  </div>
                  {/* Text */}
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color: active ? color : "var(--text-primary)", transition:"color 0.2s" }}>{label}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{sub}</div>
                  </div>
                  {/* Check */}
                  {active && (
                    <div style={{
                      width:22, height:22, borderRadius:"50%", flexShrink:0,
                      background:color, display:"grid", placeItems:"center",
                      boxShadow:`0 0 10px ${color}60`,
                      animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview strip */}
          <div style={{
            marginTop:20, padding:"14px 16px", borderRadius:14,
            background:"var(--bg-card)", border:`1px solid var(--border)`,
          }}>
            <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:8 }}>
              Aperçu
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {["Sommeil","Hydratation","Cœur","Compléments"].map((label, i) => {
                const colors = ["#818cf8","#22d3ee","#ef4444","#a855f7"];
                return (
                  <div key={label} style={{
                    flex:1, padding:"8px 4px", borderRadius:10, textAlign:"center" as const,
                    background:`${colors[i]}15`, border:`1px solid ${colors[i]}30`,
                    fontSize:9, color:colors[i], fontWeight:600,
                  }}>{label}</div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </>
  );
};

// ─── Default export: compact toggle with panel trigger ────────────────────────
const ThemeToggle = () => {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Changer le thème"
        style={{
          width:38, height:38, borderRadius:11, border:"none",
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          display:"grid", placeItems:"center", cursor:"pointer",
          transition:"background 0.2s, transform 0.2s",
          color: isDark ? "#94a3b8" : "#64748b",
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.08)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}
      >
        {isDark
          ? <Sun  size={16} style={{ color:"#f59e0b" }}/>
          : <Moon size={16} style={{ color:"#818cf8" }}/>
        }
      </button>
      {open && <ThemePanel onClose={() => setOpen(false)}/>}
    </>
  );
};

export default ThemeToggle;