import { useMemo, useState } from "react";
import type { FeasibilityData } from "@/data/feasibility-types";
import { formatIndianCurrency } from "@/data/assessment";
import { simulateLoan, repaymentStress } from "@/engine/financial";
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import {
  IndianRupee, HandCoins, Landmark, Gauge, ShieldAlert, ListChecks,
  CheckCircle2, AlertTriangle, XCircle, Sparkles, ArrowRight, TrendingUp,
  Wallet, PiggyBank, Scale as ScaleIcon, TrendingDown, Users, ClipboardList,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
 * GramUdaan — Funding & Loan (Step 5) + Scenarios (6H) + Final Recommendation
 * (Step 8). All numbers come from the shared feasibility engine — never static.
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function FundingLoanSection({ f }: { f: FeasibilityData }) {
  return (
    <div className="space-y-5">
      <FundingLoanBlock f={f} />
      {f.financial.scenarios && <ScenarioBlock f={f} />}
      <FinalRecommendationBlock f={f} />
    </div>
  );
}

/* ═══ STEP 5 — FUNDING & LOAN ═══ */

function FundingLoanBlock({ f }: { f: FeasibilityData }) {
  const fin = f.financial;
  const capital = fin.availableContribution;
  const otherFunding = fin.otherFunding ?? 0;
  const totalFunding = fin.totalAvailableFunding ?? capital + otherFunding;
  const projectCost = fin.totalProjectCost;
  const gap = fin.fundingGap ?? Math.max(0, projectCost - totalFunding);
  const estimatedLoan = fin.estimatedLoan ?? 0;
  const recommended = fin.recommendedLoan;

  const defaultRate = fin.loanDetails?.interestRate ?? 8;
  const defaultTenure = fin.loanDetails?.tenure ?? 5;

  // ── Interactive loan simulator ──
  const maxLoan = Math.max(0, gap);
  const [amount, setAmount] = useState(Math.round(maxLoan));
  const [rate, setRate] = useState(defaultRate);
  const [tenure, setTenure] = useState(defaultTenure);

  const sim = useMemo(() => simulateLoan(amount, rate, tenure), [amount, rate, tenure]);
  const opProfit = f.profitModel?.monthlyProfit ?? fin.affordability?.cashFlow ?? 0;
  const stress = useMemo(
    () => repaymentStress(amount > 0 ? sim.emiMonthly : 0, opProfit),
    [sim.emiMonthly, amount, opProfit],
  );

  const STRESS_STYLE: Record<string, { cls: string; icon: React.ReactNode }> = {
    low: { cls: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: <CheckCircle2 className="h-4 w-4" /> },
    medium: { cls: "bg-amber-50 border-amber-200 text-amber-700", icon: <AlertTriangle className="h-4 w-4" /> },
    high: { cls: "bg-red-50 border-red-200 text-red-700", icon: <XCircle className="h-4 w-4" /> },
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 transition-all hover:shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Landmark className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">Funding & Loan</h3>
          <p className="text-[11px] text-muted-foreground">Kitna paisa arrange karna padega — and can the EMI be managed?</p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600">≈ estimates</span>
      </div>

      {/* Your capital vs project cost vs gap */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <FundingStat label="Your capital" value={formatIndianCurrency(capital)} icon={<Wallet className="h-4 w-4" />} />
        <FundingStat label="Other funding" value={otherFunding > 0 ? formatIndianCurrency(otherFunding) : "₹0"} icon={<Users className="h-4 w-4" />} sub="family / partner / grant" />
        <FundingStat label="Total project cost" value={formatIndianCurrency(projectCost)} icon={<PiggyBank className="h-4 w-4" />} />
        <FundingStat
          label="Funding gap"
          value={gap > 0 ? formatIndianCurrency(gap) : "₹0 — covered"}
          icon={<HandCoins className="h-4 w-4" />}
          highlight={gap > 0 ? "amber" : "green"}
          sub={gap > 0 ? "amount to arrange" : "no external borrowing needed"}
        />
      </div>

      {/* Capital vs cost progress bar */}
      <div className="mb-4 rounded-xl border border-border/60 bg-white p-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-muted-foreground">Total funding ({formatIndianCurrency(totalFunding)}) vs project cost ({formatIndianCurrency(projectCost)})</span>
          <span className="font-bold text-foreground">
            {projectCost > 0 ? `${Math.min(100, Math.round((totalFunding / projectCost) * 100))}% covered` : "—"}
          </span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", gap > 0 ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${projectCost > 0 ? Math.min(100, (totalFunding / projectCost) * 100) : 0}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Total available funding = your capital + other funding. The gap is never shown as negative.
        </p>
      </div>

      {/* Capital surplus explanation when funded */}
      {gap <= 0 && totalFunding > projectCost && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-4">
          <p className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
            <PiggyBank className="h-4 w-4" /> Capital Surplus: {formatIndianCurrency(totalFunding - projectCost)}
          </p>
          <p className="text-xs text-emerald-800/80 mb-2">Your available funding ({formatIndianCurrency(totalFunding)}) exceeds the estimated project cost ({formatIndianCurrency(projectCost)}). You do not need external financing.</p>
          <p className="text-xs font-semibold text-emerald-700 mb-1.5">Possible uses of your surplus:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Extra inventory / wider product range",
              "Working capital buffer (3–6 months)",
              "Better / higher-capacity equipment",
              "Marketing & local promotions",
              "Emergency reserve",
            ].map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Estimated loan + recommended range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-border/60 bg-[#F4F8EF] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Estimated loan requirement</p>
          <p className="text-2xl font-bold text-primary font-serif-display mt-1">{formatIndianCurrency(estimatedLoan)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {fin.recommendedScheme} {fin.loanDetails ? ` · ${fin.loanDetails.interestRate}% p.a. · ${fin.loanDetails.tenure} yrs` : ""}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recommended borrowing range</p>
          {recommended && recommended.rangeHigh > 0 ? (
            <>
              <p className="text-lg font-bold text-foreground mt-1">
                {formatIndianCurrency(recommended.rangeLow)} – {formatIndianCurrency(recommended.rangeHigh)}
              </p>
              <ul className="mt-1.5 space-y-1">
                {recommended.reasoning.slice(0, 2).map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                    <InfoDot /> {r}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm font-semibold text-emerald-700 mt-1.5">No borrowing required — avoid a loan you don't need.</p>
          )}
        </div>
      </div>

      {/* Loan simulator */}
      <div className="rounded-xl border border-border/60 bg-white p-4">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground">Loan Simulator</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">try different terms</span>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4">
          Change the loan amount, interest rate or tenure — EMI, total interest and repayment pressure update instantly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SimSlider label="Loan amount" value={amount} min={0} max={Math.max(maxLoan, 1)} step={10000} onChange={setAmount} fmt={formatIndianCurrency} />
          <SimSlider label="Interest rate (% p.a.)" value={rate} min={0} max={18} step={0.5} onChange={setRate} fmt={(v) => `${v}%`} />
          <SimSlider label="Tenure (years)" value={tenure} min={1} max={10} step={1} onChange={setTenure} fmt={(v) => `${v} yr`} />
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SimResult label="Estimated EMI / month" value={formatIndianCurrency(sim.emiMonthly)} />
          <SimResult label="Total interest" value={formatIndianCurrency(sim.totalInterest)} />
          <SimResult label="Total repayment" value={formatIndianCurrency(sim.totalRepayment)} />
          <div className={cn("rounded-xl border p-3 flex flex-col justify-center", STRESS_STYLE[stress.level].cls)}>
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{stress.level} pressure</p>
            <p className="text-xs font-bold mt-0.5 flex items-center gap-1.5">{STRESS_STYLE[stress.level].icon} {stress.label}</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">{stress.explanation}</p>
        <p className="text-[10px] text-muted-foreground/80 mt-1.5">
          EMI figures are estimates using the standard amortizing formula. Loan approval, rate and tenure are decided by the lender — never guaranteed.
        </p>
      </div>
    </div>
  );
}

function FundingStat({ label, value, icon, sub, highlight }: {
  label: string; value: string; icon: React.ReactNode; sub?: string; highlight?: "amber" | "green";
}) {
  return (
    <div className={cn(
      "rounded-xl border p-3.5",
      highlight === "amber" ? "bg-amber-50 border-amber-200" : highlight === "green" ? "bg-emerald-50 border-emerald-200" : "bg-muted/40 border-border/60",
    )}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className={cn("text-base sm:text-lg font-bold truncate", highlight === "amber" ? "text-amber-700" : highlight === "green" ? "text-emerald-700" : "text-foreground")}>
        {value}
      </p>
      {sub && <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

function SimSlider({ label, value, min, max, step, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; fmt: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground">{label}</label>
        <span className="text-xs font-bold text-foreground">{fmt(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

function SimResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function InfoDot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />;
}

/* ═══ STEP 6H — SCENARIO ANALYSIS ═══ */

function ScenarioBlock({ f }: { f: FeasibilityData }) {
  const scenarios = f.financial.scenarios?.scenarios ?? [];
  if (scenarios.length === 0) return null;

  const RISK: Record<string, { cls: string; label: string }> = {
    low: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Lower risk" },
    medium: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Moderate risk" },
    high: { cls: "bg-red-50 text-red-700 border-red-200", label: "Higher risk" },
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 transition-all hover:shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">Scenario Analysis</h3>
          <p className="text-[11px] text-muted-foreground">Conservative vs Expected vs Optimistic — what could happen under each revenue level</p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/90 mt-2 mb-4">The optimistic case is an upper-bound estimate, not a guarantee.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((s) => {
          const risk = RISK[s.risk] ?? RISK.medium;
          const isExpected = s.id === "expected";
          return (
            <div key={s.id} className={cn(
              "rounded-xl border p-4 flex flex-col",
              isExpected ? "border-primary/30 bg-primary/[0.03] ring-1 ring-primary/10" : "border-border/60 bg-white",
            )}>
              <div className="flex items-center justify-between mb-2">
                <p className={cn("text-sm font-bold", isExpected ? "text-primary" : "text-foreground")}>
                  {s.label} <span className="text-[10px] font-semibold text-muted-foreground">({s.revenueMultiplier * 100}% revenue)</span>
                </p>
                {isExpected && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">baseline</span>}
              </div>
              <div className="space-y-1.5 text-xs mb-3">
                <Row label="Monthly revenue" value={formatIndianCurrency(s.monthlyRevenue)} />
                <Row label="Monthly expenses" value={formatIndianCurrency(s.monthlyExpenses)} />
                <Row label="Operating profit" value={formatIndianCurrency(s.monthlyProfit)} positive={s.monthlyProfit >= 0} />
                <Row label="Profit after EMI" value={formatIndianCurrency(s.profitAfterEmi)} positive={s.profitAfterEmi >= 0} />
                <Row label="Break-even" value={s.breakEvenMonth ? `~Month ${s.breakEvenMonth}` : "9+ months / not in 12"} />
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", risk.cls)}>{risk.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{s.summary}</p>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">{f.financial.scenarios?.note}</p>
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-bold", positive === undefined ? "text-foreground" : positive ? "text-emerald-600" : "text-red-600")}>{value}</span>
    </div>
  );
}

/* ═══ STEP 8 — FINAL RECOMMENDATION & ACTION PLAN ═══ */

function FinalRecommendationBlock({ f }: { f: FeasibilityData }) {
  const pm = f.profitModel;
  const fin = f.financial;
  const recommendedScale = pm?.scales.find((s) => s.id === "recommended") ?? pm?.scales[0];
  const emi = fin.loanSimulation?.emiMonthly ?? 0;
  const profitAfterEmi = pm ? pm.monthlyProfit - emi : null;

  const status = f.verdict === "good"
    ? { icon: <span className="text-2xl">🟢</span>, label: "RECOMMENDED", cls: "bg-emerald-50 border-emerald-200 text-emerald-700" }
    : f.verdict === "caution"
      ? { icon: <span className="text-2xl">🟡</span>, label: "PROCEED WITH CAUTION", cls: "bg-amber-50 border-amber-200 text-amber-700" }
      : { icon: <span className="text-2xl">🔴</span>, label: "NOT RECOMMENDED UNDER CURRENT ASSUMPTIONS", cls: "bg-red-50 border-red-200 text-red-700" };

  const mainRisks = [...f.risks]
    .sort((a, b) => (a.severity === "high" ? -1 : a.severity === "medium" ? 0 : 1) - (b.severity === "high" ? -1 : b.severity === "medium" ? 0 : 1))
    .slice(0, 3);

  const checklist = [
    "Confirm your shop / land / workspace arrangement",
    "Get 2–3 equipment and setup quotations",
    "Verify supplier prices for raw material / inventory",
    "Verify local selling prices with actual shops",
    "Study nearby competitors in person",
    "Check required licenses and registrations",
    "Verify loan eligibility with the bank / scheme office",
    "Check relevant government schemes for your business",
    "Arrange working capital for the first 1–3 months",
    "Keep an emergency buffer for slow months",
  ];

  const whyText = f.decision.whyPoints.length > 0
    ? `This business appears suitable because ${f.decision.whyPoints
        .map((p) => p.toLowerCase().replace(/\.$/, ""))
        .slice(0, 3)
        .join(", ")}.`
    : f.decision.summary;

  const whyNotText = (() => {
    const notes: string[] = [];
    if (recommendedScale) {
      const expanded = pm?.scales.find((s) => s.id === "expanded");
      if (expanded && expanded.investment > (pm?.capital.availableCapital ?? 0)) {
        notes.push(`A larger scale could generate more profit but needs ₹${(expanded.investment - (pm?.capital.availableCapital ?? 0)).toLocaleString("en-IN")} more funding and creates higher repayment pressure.`);
      }
    }
    if (f.alternatives && f.alternatives.length > 0) {
      const top = f.alternatives[0];
      notes.push(`Among the alternatives, ${top.businessName} ranked ${top.fitScore}/100 fit — ${top.reasons[0]?.toLowerCase()}. It is worth comparing, but the current plan fits your inputs best overall.`);
    }
    if (notes.length === 0) notes.push("Under the current assumptions, the recommended path balances your capital, expected revenue and repayment capacity better than the alternatives.");
    return notes;
  })();

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-white p-5 sm:p-7 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-foreground font-serif-display">GramUdaan Recommendation</h3>
          <p className="text-[11px] text-muted-foreground">Your personalised decision summary — the most important conclusions only</p>
        </div>
      </div>

      {/* Status */}
      <div className={cn("rounded-xl border px-4 py-3 mb-5 flex items-center gap-3", status.cls)}>
        {status.icon}
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">{status.label}</p>
          <p className="text-[11px] opacity-80 mt-0.5">Feasibility {f.overallScore}/100 · {f.verdictLabel}</p>
        </div>
      </div>

      {/* Best fit summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <BestFit label="Recommended business" value={pm?.subCategoryName ?? "—"} icon={<TrendingUp className="h-4 w-4" />} />
        <BestFit label="Recommended scale" value={recommendedScale?.label ?? "—"} icon={<ScaleIcon className="h-4 w-4" />} />
        <BestFit label="Break-even" value={pm?.breakEvenMonth ? `~Month ${pm.breakEvenMonth}` : "9+ months"} icon={<TrendingDown className="h-4 w-4" />} />
        <BestFit label="Risk" value={pm?.risk.label ?? "—"} icon={<ShieldAlert className="h-4 w-4" />} />
        <BestFit label="Your capital" value={formatIndianCurrency(fin.availableContribution)} icon={<Wallet className="h-4 w-4" />} />
        <BestFit label="Project cost" value={formatIndianCurrency(fin.totalProjectCost)} icon={<PiggyBank className="h-4 w-4" />} />
        <BestFit label="Funding gap" value={formatIndianCurrency(fin.fundingGap ?? 0)} icon={<HandCoins className="h-4 w-4" />} />
        <BestFit label="Estimated EMI" value={emi > 0 ? formatIndianCurrency(emi) : "₹0"} icon={<Landmark className="h-4 w-4" />} />
        <BestFit label="Monthly revenue" value={pm ? formatIndianCurrency(pm.monthlyRevenue) : "—"} icon={<IndianRupee className="h-4 w-4" />} />
        <BestFit label="Monthly expenses" value={pm ? formatIndianCurrency(pm.monthlyExpenses) : "—"} icon={<IndianRupee className="h-4 w-4" />} />
        <BestFit label="Operating profit" value={pm ? formatIndianCurrency(pm.monthlyProfit) : "—"} icon={<TrendingUp className="h-4 w-4" />} />
        <BestFit label="Profit after EMI" value={profitAfterEmi !== null ? formatIndianCurrency(profitAfterEmi) : "—"} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      {/* Why / why not */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Why this business?</p>
          <p className="text-xs text-emerald-800/90 leading-relaxed">{whyText}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-amber-500" /> Why not the other options?</p>
          <ul className="space-y-1.5">
            {whyNotText.map((n, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                <InfoDot /> {n}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main risks */}
      {mainRisks.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 mb-5">
          <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4" /> Main risks to watch</p>
          <div className="flex flex-wrap gap-2">
            {mainRisks.map((r) => (
              <span key={r.id} className="rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-semibold text-red-700">
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Checklist + next steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-white p-4">
          <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5"><ListChecks className="h-4 w-4 text-primary" /> Before you start</p>
          <ul className="space-y-1.5">
            {checklist.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 h-3 w-3 rounded border border-primary/40 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border/60 bg-white p-4">
          <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5"><ClipboardList className="h-4 w-4 text-primary" /> Your next 5 steps</p>
          <ol className="space-y-2">
            {f.nextSteps.slice(0, 5).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary flex-shrink-0">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] text-muted-foreground">
          Recommendation is based on the estimates above — verify with local suppliers, lenders and officials before investing.
        </p>
        <div className="flex gap-2">
          <Link
            to="/what-if"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Try What-If <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/advisor"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ask GramUdaan <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function BestFit({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <p className="text-[9px] font-semibold uppercase tracking-wider truncate">{label}</p>
      </div>
      <p className="text-sm font-bold text-foreground truncate" title={value}>{value}</p>
    </div>
  );
}