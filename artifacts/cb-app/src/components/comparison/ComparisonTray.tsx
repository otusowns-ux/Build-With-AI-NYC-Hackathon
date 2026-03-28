import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3 } from "lucide-react";

export interface ComparisonEntry {
  id: string;
  address: string;
  yearBuilt: number | null;
  pppCoverageRate: number | null;
  mortgageDenialRate: number | null;
  lat: number;
  lng: number;
}

interface ComparisonTrayProps {
  entries: ComparisonEntry[];
  onRemove: (id: string) => void;
  onCompare: () => void;
}

export function ComparisonTray({ entries, onRemove, onCompare }: ComparisonTrayProps) {
  if (entries.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="comparison-tray"
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-8px_40px_rgba(0,0,0,0.12)]"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Comparison
          </span>

          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <AnimatePresence mode="popLayout">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-background border border-border rounded-lg shadow-sm text-sm group"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-xs leading-tight truncate max-w-[140px]">
                      {entry.address.split(",")[0]}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {entry.yearBuilt ? `Built ${entry.yearBuilt}` : "Year unknown"}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    aria-label="Remove from comparison"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {entries.length < 3 && (
              <p className="text-xs text-muted-foreground/60 italic">
                {3 - entries.length} slot{3 - entries.length !== 1 ? "s" : ""} remaining
              </p>
            )}
          </div>

          {entries.length >= 2 && (
            <motion.button
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onCompare}
              className="shrink-0 flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-xs font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Compare Blocks
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
