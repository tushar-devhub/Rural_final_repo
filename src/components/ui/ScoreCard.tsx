import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score: number;
  verdict: "good" | "caution" | "rethink";
  verdictLabel: string;
  businessName: string;
  locationName: string;
  className?: string;
}

export function ScoreCard({
  score,
  verdict,
  verdictLabel,
  businessName,
  locationName,
  className,
}: ScoreCardProps) {
  const verdictColors = {
    good: "text-emerald-600",
    caution: "text-amber-600",
    rethink: "text-red-600",
  };

  const verdictBg = {
    good: "bg-emerald-50",
    caution: "bg-amber-50",
    rethink: "bg-red-50",
  };

  const verdictIcon = {
    good: "🟢",
    caution: "🟡",
    rethink: "🔴",
  };

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
        Business Feasibility
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
        {/* Score circle */}
        <div className="relative flex-shrink-0">
          <svg width="130" height="130" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              className="text-muted/60"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              className={
                verdict === "good"
                  ? "text-emerald-500"
                  : verdict === "caution"
                    ? "text-amber-500"
                    : "text-red-500"
              }
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{score}</span>
            <span className="text-xs text-muted-foreground font-medium">/ 100</span>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
              verdictBg[verdict],
              verdictColors[verdict],
            )}
          >
            <span>{verdictIcon[verdict]}</span>
            {verdictLabel}
          </div>
          <h3 className="mt-3 text-xl font-bold text-foreground">{businessName}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{locationName}</p>
        </div>
      </div>
    </div>
  );
}
