import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SupplementCardProps {
  name: string;
  reason: string;
  sources?: string;
  priority?: "high" | "medium" | "low";
}

const priorityLabels: Record<string, { label: string; className: string }> = {
  high: { label: "Haute", className: "bg-health-danger-bg text-health-danger-foreground" },
  medium: { label: "Moyenne", className: "bg-health-warning-bg text-health-warning-foreground" },
  low: { label: "Faible", className: "bg-health-good-bg text-health-good-foreground" },
};

const SupplementCard = ({ name, reason, sources, priority }: SupplementCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">💊</span>
          <span className="font-medium text-card-foreground">{name}</span>
          {priority && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityLabels[priority].className}`}>
              {priorityLabels[priority].label}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              <p className="text-sm text-muted-foreground">{reason}</p>
              {sources && (
                <p className="text-sm text-primary">
                  <span className="font-medium">Sources naturelles :</span> {sources}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplementCard;
