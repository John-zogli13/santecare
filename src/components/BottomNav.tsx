import { useLocation, useNavigate } from "react-router-dom";
import { Moon, Droplets, Heart, Pill, UtensilsCrossed } from "lucide-react";
import { useEffect } from "react";

const tabs = [
  { path: "/sleep",       label: "Sommeil",     icon: Moon,           color: "#818cf8", glow: "rgba(129,140,248,0.35)" },
  { path: "/hydration",   label: "Hydratation", icon: Droplets,       color: "#22d3ee", glow: "rgba(34,211,238,0.35)"  },
  { path: "/cardio",      label: "Cœur",        icon: Heart,          color: "#ef4444", glow: "rgba(239,68,68,0.35)"   },
  { path: "/supplements", label: "Compléments", icon: Pill,           color: "#a855f7", glow: "rgba(168,85,247,0.35)"  },
  { path: "/food",        label: "Aliments",    icon: UtensilsCrossed,color: "#22c55e", glow: "rgba(34,197,94,0.35)"   },
];

const NAV_HEIGHT = 76;

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.getElementById("bnav-padding") || (() => {
      const s = document.createElement("style");
      s.id = "bnav-padding";
      document.head.appendChild(s);
      return s;
    })();
    style.textContent = `
      body > #root,
      [data-main-scroll],
      .hydro-root, .cardio-root, .sleep-root, .supp-root {
        padding-bottom: ${NAV_HEIGHT + 16}px !important;
      }
    `;
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .bnav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          padding: 0 0 env(safe-area-inset-bottom, 10px);
          background: rgba(8, 13, 20, 0.82);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-top: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 -1px 0 rgba(255,255,255,0.03), 0 -20px 60px rgba(0,0,0,0.5);
        }

        .bnav-inner {
          display: flex;
          align-items: center;
          padding: 8px 12px 4px;
          gap: 4px;
          max-width: 480px;
          margin: 0 auto;
          /* Mobile: scrollable */
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .bnav-inner::-webkit-scrollbar { display: none; }

        /* Desktop: centré, plus de scroll */
        @media (min-width: 600px) {
          .bnav-inner {
            justify-content: center;
            overflow-x: visible;
            max-width: 600px;
          }
        }

        .bnav-btn {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 6px 14px; border-radius: 14px; border: none;
          background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          position: relative; transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          -webkit-tap-highlight-color: transparent;
          flex-shrink: 0;
        }
        .bnav-btn:active { transform: scale(0.9); }

        .bnav-icon-wrap {
          position: relative;
          width: 36px; height: 36px;
          display: grid; place-items: center;
          border-radius: 12px;
          transition: background 0.25s, box-shadow 0.25s;
        }

        .bnav-btn.active .bnav-icon-wrap {
          background: var(--tab-color-bg);
          box-shadow: 0 0 20px var(--tab-glow), inset 0 0 10px var(--tab-color-bg);
        }

        .bnav-icon {
          transition: color 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          color: #334155;
        }
        .bnav-btn.active .bnav-icon {
          color: var(--tab-color);
          transform: translateY(-1px) scale(1.08);
          filter: drop-shadow(0 0 6px var(--tab-glow));
        }
        .bnav-btn:not(.active):hover .bnav-icon { color: #64748b; }

        .bnav-dot {
          position: absolute; bottom: -3px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--tab-color);
          box-shadow: 0 0 8px var(--tab-glow);
          opacity: 0; transform: translateX(-50%) scale(0);
          transition: opacity 0.25s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .bnav-btn.active .bnav-dot {
          opacity: 1; transform: translateX(-50%) scale(1);
        }

        .bnav-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.02em;
          color: #334155; transition: color 0.2s;
          white-space: nowrap;
        }
        .bnav-btn.active .bnav-label { color: var(--tab-color); font-weight: 600; }
        .bnav-btn:not(.active):hover .bnav-label { color: #64748b; }

        .bnav-btn.active { transform: translateY(-2px); }

        .bnav-btn::after {
          content: '';
          position: absolute; inset: 0; border-radius: 14px;
          background: var(--tab-color);
          opacity: 0; transform: scale(0.6);
          transition: opacity 0.3s, transform 0.4s;
          pointer-events: none;
        }
        .bnav-btn:active::after {
          opacity: 0.08; transform: scale(1);
          transition: opacity 0s, transform 0s;
        }
      `}</style>

      <nav className="bnav" role="navigation" aria-label="Navigation principale">
        <div className="bnav-inner">
          {tabs.map(({ path, label, icon: Icon, color, glow }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`bnav-btn ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                style={{
                  "--tab-color": color,
                  "--tab-glow": glow,
                  "--tab-color-bg": `${color}18`,
                } as React.CSSProperties}
              >
                <div className="bnav-icon-wrap">
                  <Icon className="bnav-icon" size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="bnav-dot" />
                </div>
                <span className="bnav-label">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;