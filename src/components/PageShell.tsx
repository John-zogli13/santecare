import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageShellProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
}

const PageShell = ({ children, title, icon }: PageShellProps) => {
  return (
    <div className="min-h-screen pb-24" style={{ background: "#000000" }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4 mx-auto max-w-lg">

        {/* ── Logo centré au-dessus du titre ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}
        >
          <img
            src="/logo.png"
            alt="SantéCare"
            style={{
              height: 52,
              width: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 0 14px rgba(34,197,94,0.3))",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/logo.png";
            }}
          />
        </motion.div>

        {/* ── Titre de la page + icône du module ── */}
        {(title || icon) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            {icon && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 38, height: 38, borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                {icon}
              </div>
            )}
            {title && (
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.02em",
              }}>
                {title}
              </h1>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Contenu de la page ── */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mx-auto max-w-lg px-4"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default PageShell;