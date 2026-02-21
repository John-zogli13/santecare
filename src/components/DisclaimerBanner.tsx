import { useState } from "react";
import { isDisclaimerAccepted, acceptDisclaimer } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Heart, Stethoscope, Sparkles } from "lucide-react";

const DisclaimerBanner = () => {
  const [visible, setVisible] = useState(!isDisclaimerAccepted());

  const handleAccept = () => {
    acceptDisclaimer();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(0,0,0,0.80)",
            backdropFilter: "blur(20px)",
            padding: "0 0 0 0",
          }}
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');
            @keyframes shimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            @keyframes pulse-ring {
              0% { transform: scale(0.9); opacity: 0.8; }
              50% { transform: scale(1.1); opacity: 0.3; }
              100% { transform: scale(0.9); opacity: 0.8; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-5px); }
            }
            .disclaimer-btn {
              width: 100%;
              padding: 16px;
              border: none;
              border-radius: 16px;
              background: linear-gradient(135deg, #22c55e, #16a34a);
              color: white;
              font-family: 'Syne', sans-serif;
              font-size: 15px;
              font-weight: 700;
              cursor: pointer;
              position: relative;
              overflow: hidden;
              box-shadow: 0 8px 32px rgba(34,197,94,0.35), 0 2px 8px rgba(34,197,94,0.2);
              transition: transform 0.15s ease, box-shadow 0.15s ease;
              letter-spacing: 0.02em;
            }
            .disclaimer-btn::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
              background-size: 200% 100%;
              animation: shimmer 2.5s infinite;
            }
            .disclaimer-btn:active {
              transform: scale(0.98);
              box-shadow: 0 4px 16px rgba(34,197,94,0.25);
            }
            .disclaimer-btn:hover {
              box-shadow: 0 12px 40px rgba(34,197,94,0.45), 0 2px 8px rgba(34,197,94,0.2);
            }
          `}</style>

          <motion.div
            initial={{ y: 140, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 140, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
            style={{
              width: "100%",
              maxWidth: 480,
              borderRadius: "28px 28px 0 0",
              background: "linear-gradient(180deg, #0f1520 0%, #080c14 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              padding: "28px 24px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background glow */}
            <div style={{
              position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
              width: 360, height: 360,
              background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}/>

            {/* Drag handle */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: "rgba(255,255,255,0.15)",
              margin: "0 auto 24px",
            }}/>

            {/* ── Logo ── */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
            >
              <img
                src="/logo.png"
                alt="SantéCare"
                style={{
                  height: 48,
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 14px rgba(34,197,94,0.35))",
                  animation: "float 3.5s ease infinite",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/santé care logo.png";
                }}
              />
            </motion.div>

            {/* ── App description ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              style={{
                padding: "14px 16px",
                borderRadius: 16,
                marginBottom: 20,
                background: "rgba(34,197,94,0.05)",
                border: "1px solid rgba(34,197,94,0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Sparkles size={13} style={{ color: "#22c55e" }}/>
                <span style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 11, fontWeight: 700,
                  color: "#22c55e",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  Votre assistant bien-être
                </span>
              </div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "#94a3b8",
                lineHeight: 1.65,
                margin: 0,
              }}>
                SantéCare analyse votre{" "}
                <span style={{ color: "#e2e8f0", fontWeight: 500 }}>
                  sommeil, hydratation, alimentation et activité physique
                </span>{" "}
                pour vous fournir des conseils personnalisés et rendre la prévention santé accessible à tous.
              </p>
            </motion.div>

            {/* Title */}
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 4,
              letterSpacing: "-0.02em",
            }}>
              Avant de commencer
            </h2>

            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "#64748b",
              textAlign: "center",
              marginBottom: 18,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}>
              Avertissement important
            </p>

            {/* Info cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {[
                {
                  icon: <Heart size={15} style={{ color: "#ef4444" }}/>,
                  bg: "rgba(239,68,68,0.08)",
                  border: "rgba(239,68,68,0.15)",
                  text: "Cette application fournit des conseils préventifs et éducatifs uniquement.",
                },
                {
                  icon: <Stethoscope size={15} style={{ color: "#22d3ee" }}/>,
                  bg: "rgba(34,211,238,0.06)",
                  border: "rgba(34,211,238,0.15)",
                  text: "Elle ne remplace pas un professionnel de santé qualifié.",
                },
                {
                  icon: <ShieldCheck size={15} style={{ color: "#22c55e" }}/>,
                  bg: "rgba(34,197,94,0.06)",
                  border: "rgba(34,197,94,0.15)",
                  text: "Consultez votre médecin pour tout problème médical.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.08 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 14px",
                    borderRadius: 13,
                    background: item.bg,
                    border: `1px solid ${item.border}`,
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    background: "rgba(255,255,255,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {item.icon}
                  </div>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: "#94a3b8",
                    lineHeight: 1.5,
                  }}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <button className="disclaimer-btn" onClick={handleAccept}>
                J'ai compris, commencer →
              </button>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: "#334155",
                textAlign: "center",
                marginTop: 12,
                lineHeight: 1.5,
              }}>
                En continuant, vous acceptez les conditions d'utilisation
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerBanner;