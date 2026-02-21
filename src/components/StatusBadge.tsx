import { motion } from "framer-motion";

type Status = "good" | "warning" | "danger";

const config: Record<Status, { emoji: string; bg: string; text: string }> = {
  good: { emoji: "🟢", bg: "bg-health-good-bg", text: "text-health-good-foreground" },
  warning: { emoji: "🟡", bg: "bg-health-warning-bg", text: "text-health-warning-foreground" },
  danger: { emoji: "🔴", bg: "bg-health-danger-bg", text: "text-health-danger-foreground" },
};

interface StatusBadgeProps {
  status: Status;
  label: string;
  large?: boolean;
}

const StatusBadge = ({ status, label, large }: StatusBadgeProps) => {
  const { emoji, bg, text } = config[status];
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 rounded-full ${bg} ${text} ${
        large ? "px-5 py-3 text-base font-semibold" : "px-3 py-1.5 text-sm font-medium"
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </motion.div>
  );
};

export default StatusBadge;
