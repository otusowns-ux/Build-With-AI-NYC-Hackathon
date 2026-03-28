import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ComparisonEntry } from "./ComparisonTray";

interface ComparisonModalProps {
  entries: ComparisonEntry[];
  open: boolean;
  onClose: () => void;
}

function MetricBar({
  value,
  max,
  isWarning,
  isGood,
  unit = "%",
}: {
  value: number | null;
  max: number;
  isWarning?: boolean;
  isGood?: boolean;
  unit?: string;
}) {
  if (value === null) {
    return (
      <div className="mt-2">
        <div className="h-2 bg-muted/40 rounded-full" />
        <p className="text-[10px] text-muted-foreground mt-1">No data</p>
      </div>
    );
  }

  const pct = Math.min(100, (value / max) * 100);
  const barColor = isWarning
    ? "bg-amber-500"
    : isGood
      ? "bg-emerald-500"
      : "bg-foreground/40";

  return (
    <div className="mt-2">
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      <p className={`text-xs font-semibold mt-1 ${isWarning ? "text-amber-600" : isGood ? "text-emerald-600" : "text-foreground"}`}>
        {value.toFixed(1)}{unit}
      </p>
    </div>
  );
}

function sectionLabel(label: string) {
  return (
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-5 mb-0.5">
      {label}
    </p>
  );
}

export function ComparisonModal({ entries, open, onClose }: ComparisonModalProps) {
  if (entries.length === 0) return null;

  const validPPP = entries.map((e) => e.pppCoverageRate).filter((v): v is number => v !== null);
  const validDenial = entries.map((e) => e.mortgageDenialRate).filter((v): v is number => v !== null);

  const minPPP = validPPP.length > 0 ? Math.min(...validPPP) : null;
  const maxPPP = validPPP.length > 0 ? Math.max(...validPPP) : null;
  const minDenial = validDenial.length > 0 ? Math.min(...validDenial) : null;
  const maxDenial = validDenial.length > 0 ? Math.max(...validDenial) : null;

  const pppDisparity = maxPPP !== null && minPPP !== null ? maxPPP - minPPP : 0;
  const denialDisparity = maxDenial !== null && minDenial !== null ? maxDenial - minDenial : 0;

  const pppBarMax = Math.max(100, ...(validPPP.length ? [Math.max(...validPPP) * 1.15] : []));
  const denialBarMax = Math.max(40, ...(validDenial.length ? [Math.max(...validDenial) * 1.3] : []));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[61] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground tracking-tight">
                  Block Comparison
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Civic equity metrics side-by-side
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Disparity Banner */}
            {(pppDisparity > 10 || denialDisparity > 8) && (
              <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-800/30 shrink-0">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Significant equity gap detected — these blocks show meaningful disparities in economic access.
                </p>
              </div>
            )}

            {/* Columns */}
            <div className="flex-1 overflow-auto">
              <div
                className="grid divide-x divide-border h-full min-h-0"
                style={{ gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))` }}
              >
                {entries.map((entry) => {
                  const ppp = entry.pppCoverageRate;
                  const denial = entry.mortgageDenialRate;

                  const pppIsLow = ppp !== null && minPPP !== null && pppDisparity > 10 && ppp === minPPP;
                  const pppIsHigh = ppp !== null && maxPPP !== null && pppDisparity > 10 && ppp === maxPPP;
                  const denialIsHigh = denial !== null && maxDenial !== null && denialDisparity > 8 && denial === maxDenial;
                  const denialIsLow = denial !== null && minDenial !== null && denialDisparity > 8 && denial === minDenial;

                  return (
                    <div key={entry.id} className="px-6 py-6 flex flex-col min-w-0">
                      {/* Location Header */}
                      <div className="pb-4 border-b border-border/60">
                        <h3 className="font-serif text-base font-semibold text-foreground leading-tight">
                          {entry.address.split(",")[0]}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                          {entry.address.split(",").slice(1).join(",").trim()}
                        </p>
                      </div>

                      {/* Year Built */}
                      {sectionLabel("Year Built")}
                      <p className="text-2xl font-serif font-semibold text-foreground">
                        {entry.yearBuilt ?? "—"}
                      </p>

                      {/* PPP Coverage */}
                      {sectionLabel("SBA PPP Loan Coverage")}
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        Share of eligible businesses that received pandemic relief loans
                      </p>
                      <MetricBar
                        value={ppp}
                        max={pppBarMax}
                        isWarning={pppIsLow}
                        isGood={pppIsHigh}
                      />
                      {pppIsLow && (
                        <p className="text-[10px] text-amber-600 mt-1 font-medium">
                          ↓ Significantly below comparison
                        </p>
                      )}
                      {pppIsHigh && pppDisparity > 10 && (
                        <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                          ↑ Highest in comparison
                        </p>
                      )}

                      {/* Mortgage Denial Rate */}
                      {sectionLabel("Mortgage Denial Rate")}
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        HMDA — share of home loan applications denied
                      </p>
                      <MetricBar
                        value={denial}
                        max={denialBarMax}
                        isWarning={denialIsHigh}
                        isGood={denialIsLow}
                      />
                      {denialIsHigh && (
                        <p className="text-[10px] text-amber-600 mt-1 font-medium">
                          ↑ Highest denial rate in comparison
                        </p>
                      )}
                      {denialIsLow && denialDisparity > 8 && (
                        <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                          ↓ Lowest denial rate — most accessible
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
