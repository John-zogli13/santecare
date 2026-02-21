import { motion } from "framer-motion";
import { Sparkles, Sun, Sunset, Moon } from "lucide-react";

interface GreetingHeaderProps {
  name?: string;
  meal?: string;
}

const GreetingHeader = ({ name = "champion", meal = "Poulet grillé" }: GreetingHeaderProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Bonjour", icon: <Sun size={14} style={{ color: "#f59e0b" }} />, color: "#f59e0b" };
    if (hour < 18) return { text: "Bon après-midi", icon: <Sunset size={14} style={{ color: "#f97316" }} />, color: "#f97316" };
    return { text: "Bonsoir", icon: <Moon size={14} style={{ color: "#a78bfa" }} />, color: "#a78bfa" };
  };

  const greeting = getGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ marginBottom: 24, position: "relative" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        @keyframes shimmer-text {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Salutation badge */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          borderRadius: 100,
          background: `${greeting.color}12`,
          border: `1px solid ${greeting.color}25`,
          marginBottom: 12,
        }}
      >
        {greeting.icon}
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 500,
          color: greeting.color,
          letterSpacing: "0.04em",
        }}>
          {greeting.text}
        </span>
      </motion.div>

      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 24,
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
          margin: 0,
        }}>
          Qu'est-ce qui vous fait envie,{" "}
          <span style={{
            background: "linear-gradient(90deg, #22c55e, #86efac, #22c55e)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer-text 3s linear infinite",
          }}>
            {name}
          </span>
          {" "}?
        </h1>
      </motion.div>

      {/* Suggestion subtile */}
      {meal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
          }}
        >
          <Sparkles size={12} style={{ color: "#475569" }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#475569",
          }}>
            Suggestion du jour ·{" "}
            <span style={{ color: "#64748b", fontWeight: 500 }}>{meal}</span>
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GreetingHeader;