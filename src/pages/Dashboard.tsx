import { useOnboarding } from "@/lib/onboarding-context";
import { formatIndianCurrency, getSeverityColor, getVerdictColor, getVerdictBg, getVerdictIcon } from "@/data/assessment";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { SWOTGrid } from "@/components/ui/SWOTGrid";
import { DataConfidenceBadge } from "@/components/ui/DataConfidenceBadge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Users,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  Target,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  ChevronRight,
  CircleDot,
  Home,
  Store,
  Calculator,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { feasibility, location, business, capital, radius } = useOnboarding();

  if (!feasibility) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar variant="app" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="h-16 w-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Analysis Found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You haven't run an assessment yet. Tell us about your business idea and we will analyze it for you.
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Assessment
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const f = feasibility;
  const locationLabel = location
    ? `${location.name}, ${location.district}`
    : "Selected Location";

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="app" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Feasibility Dashboard</span>
        </div>

        {/* Score Card with Sub-Scores */}
        <ScoreCard
          score={f.overallScore}
          verdict={f.verdict}
          verdictLabel={f.verdictLabel}
          businessName={business?.name || "Your Business"}
          locationName={`${locationLabel} • ${radius} km radius`}
          subScores={f.subScores}
        />

        {/* Data Trust */}
        <div className="mt-4">
          <DataConfidenceBadge type="estimated" confidence="medium" />
          <p className="text-xs text-muted-foreground mt-1 ml-1">
            Analysis based on simulated market data for demonstration purposes
          </p>
        </div>

        {/* Section Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Market Reach */}
          <SectionCard
            icon={<Users className="h-5 w-5" />}
            title="Market Reach"
            badge="Estimated"
            score={f.subScores?.marketScore}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MetricBlock label="Population" value={f.marketReach.population.toLocaleString("en-IN")} />
              <MetricBlock label="Households" value={f.marketReach.households.toLocaleString("en-IN")} />
              <MetricBlock label="Potential Customers" value={f.marketReach.potentialCustomers.toLocaleString("en-IN")} />
              <MetricBlock label="Nearby Villages" value={f.marketReach.nearbyVillages.toString()} />
            </div>
            <div className="mb-3">
              <p className="text-xs font-semibold text-foreground mb-1.5">Customer Groups</p>
              <div className="flex flex-wrap gap-1.5">
                {f.marketReach.customerGroups.map((g) => (
                  <span key={g} className="rounded-full bg-primary/5 border border-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs font-semibold text-foreground mb-1.5">Distribution Channels</p>
              <div className="flex flex-wrap gap-1.5">
                {f.marketReach.distributionChannels.map((d) => (
                  <span key={d} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.marketReach.summary}</p>
          </SectionCard>

          {/* Opportunity */}
          <SectionCard
            icon={<Lightbulb className="h-5 w-5" />}
            title="Opportunity"
            badge="AI Insight"
            badgeType="ai"
            score={f.subScores?.opportunityScore}
          >
            <div className="mb-4">
              <p className="text-xs font-semibold text-foreground mb-2">Existing Businesses in Area</p>
              <div className="space-y-2">
                {f.opportunity.existingBusinesses.map((b) => (
                  <div key={b.name} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-28 truncate">{b.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full"
                        style={{ width: `${Math.min(100, (b.count / 40) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-6 text-right">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-3">
              <p className="text-xs font-semibold text-primary mb-0.5">💡 Market Gap</p>
              <p className="text-xs text-muted-foreground">{f.opportunity.underserved}</p>
            </div>
            {f.opportunity.highCompetitionWarning && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-3">
                <p className="text-xs font-semibold text-amber-700 mb-0.5">⚠️ Competition Alert</p>
                <p className="text-xs text-amber-600">{f.opportunity.highCompetitionWarning}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">{f.opportunity.summary}</p>
          </SectionCard>

          {/* SWOT */}
          <SectionCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="SWOT Analysis"
            badge="Personalized"
            className="lg:col-span-2"
          >
            <SWOTGrid
              strengths={f.swot.strengths}
              weaknesses={f.swot.weaknesses}
              opportunities={f.swot.opportunities}
              threats={f.swot.threats}
            />
            <div className="mt-3">
              <DataConfidenceBadge type="ai-insight" confidence="medium" />
              <p className="text-[11px] text-muted-foreground mt-1">
                Personalized based on your location + business + capital + local data
              </p>
            </div>
          </SectionCard>

          {/* Local Risks */}
          <SectionCard
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Local Risks"
            badge="Estimated"
            score={f.subScores?.riskScore}
          >
            <div className="space-y-3">
              {f.risks.map((risk) => (
                <div key={risk.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border", getSeverityColor(risk.severity))}>
                      {risk.severity.toUpperCase()}
                    </span>
                    <span className="text-sm font-bold text-foreground">{risk.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{risk.explanation}</p>
                  <div className="flex items-start gap-1.5">
                    <Zap className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-medium text-primary">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Competition */}
          <SectionCard
            icon={<Target className="h-5 w-5" />}
            title="Competition"
            badge="Estimated"
            score={f.subScores?.competitionScore}
          >
            {/* Competition map placeholder */}
            <div className="rounded-xl bg-[#F4F8EF] border border-border/60 h-36 flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="text-center relative z-10">
                <Target className="h-6 w-6 text-primary/40 mx-auto mb-1" />
                <p className="text-xs font-semibold text-foreground">{f.competition.totalBusinesses} competitors found</p>
                <p className="text-[11px] text-muted-foreground">
                  Density:{" "}
                  <span className={cn(
                    "font-bold",
                    f.competition.density === "high" ? "text-red-600" : f.competition.density === "medium" ? "text-amber-600" : "text-emerald-600",
                  )}>
                    {f.competition.density.toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="absolute inset-0 opacity-10">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-primary"
                    style={{
                      left: `${10 + (i * 4.2) % 80}%`,
                      top: `${15 + (i * 7.3) % 70}%`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {f.competition.competitors.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <CircleDot className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-muted-foreground">{c.type}</span>
                    <span className="text-muted-foreground font-medium">{c.distance}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.competition.summary}</p>
          </SectionCard>

          {/* Pricing */}
          <SectionCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Product Pricing"
            badge="AI Insight"
            badgeType="ai"
          >
            {f.pricing.unit && (
              <p className="text-xs text-muted-foreground mb-3">Unit: {f.pricing.unit}</p>
            )}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Regional Price</p>
                <p className="text-lg font-bold text-foreground mt-1">{f.pricing.regionalPrice}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Competitor Range</p>
                <p className="text-sm font-bold text-foreground mt-1">{f.pricing.competitorRange}</p>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Recommended</p>
                <p className="text-lg font-bold text-primary mt-1">{f.pricing.recommendedPrice}</p>
              </div>
            </div>
            {/* Why this price */}
            <div className="rounded-lg bg-muted/50 p-3 mb-3">
              <p className="text-xs font-semibold text-foreground mb-1">Why this price?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.pricing.explanation}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.pricing.explanation}</p>
          </SectionCard>

          {/* Financial Overview — Full Engine */}
          <SectionCard
            icon={<IndianRupee className="h-5 w-5" />}
            title="Financial Overview"
            badge="Engine"
            badgeType="verified"
            className="lg:col-span-2"
          >
            {/* Project Cost Breakdown */}
            {f.financial.projectCostBreakdown && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                  <Calculator className="h-3.5 w-3.5" />
                  Project Cost Breakdown
                </h4>

                {f.financial.projectCostBreakdown.isLimitExceeded && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-700">Scheme Limit Exceeded</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Calculated project cost ({formatIndianCurrency(f.financial.projectCostBreakdown.rawProjectCost)}) exceeds the scheme maximum of {formatIndianCurrency(f.financial.projectCostBreakdown.schemeMaxFunding * 1.11)}.
                          A compliant structure is shown below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricBlock
                    label="Your Contribution"
                    value={formatIndianCurrency(f.financial.projectCostBreakdown.entrepreneurContribution)}
                    highlight
                  />
                  <MetricBlock
                    label={f.financial.projectCostBreakdown.isLimitExceeded ? "Compliant Project Cost" : "Total Project Cost"}
                    value={formatIndianCurrency(f.financial.projectCostBreakdown.isLimitExceeded ? f.financial.projectCostBreakdown.compliantProjectCost || f.financial.totalProjectCost : f.financial.totalProjectCost)}
                  />
                  <MetricBlock
                    label="Agency Funding"
                    value={formatIndianCurrency(f.financial.projectCostBreakdown.isLimitExceeded ? f.financial.projectCostBreakdown.compliantAgencyFunding || f.financial.potentialLoan : f.financial.potentialLoan)}
                  />
                  <MetricBlock
                    label="Your Contribution (Scheme)"
                    value={f.financial.projectCostBreakdown.isLimitExceeded ? formatIndianCurrency(f.financial.projectCostBreakdown.compliantEntrepreneurContribution || 0) : "—"}
                  />
                </div>
              </div>
            )}

            {/* Loan Details */}
            {f.financial.loanDetails && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Loan Details — {f.financial.recommendedScheme}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricBlock
                    label="Loan Amount"
                    value={formatIndianCurrency(f.financial.loanDetails.amount)}
                  />
                  <MetricBlock
                    label="Interest Rate"
                    value={`${f.financial.loanDetails.interestRate}%`}
                  />
                  <MetricBlock
                    label="Tenure"
                    value={`${f.financial.loanDetails.tenure} years`}
                  />
                  <MetricBlock
                    label="Moratorium"
                    value={`${f.financial.loanDetails.moratorium} months`}
                  />
                </div>
              </div>
            )}

            {/* Affordability */}
            {f.financial.affordability && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-foreground mb-3">Affordability Assessment</h4>
                <div className={cn(
                  "rounded-xl border p-4",
                  f.financial.affordability.rating === "comfortable"
                    ? "bg-emerald-50 border-emerald-200"
                    : f.financial.affordability.rating === "tight"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-red-50 border-red-200",
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{f.financial.affordability.ratingIcon}</span>
                    <span className={cn(
                      "text-sm font-bold",
                      f.financial.affordability.rating === "comfortable"
                        ? "text-emerald-700"
                        : f.financial.affordability.rating === "tight"
                          ? "text-amber-700"
                          : "text-red-700",
                    )}>
                      {f.financial.affordability.ratingLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Expected Revenue</p>
                      <p className="font-semibold text-foreground">{formatIndianCurrency(f.financial.affordability.expectedRevenue)}/mo</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Operating Costs</p>
                      <p className="font-semibold text-foreground">{formatIndianCurrency(f.financial.affordability.operatingCosts)}/mo</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cash Flow</p>
                      <p className="font-semibold text-foreground">{formatIndianCurrency(f.financial.affordability.cashFlow)}/mo</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Loan Repayment</p>
                      <p className="font-semibold text-foreground">{formatIndianCurrency(f.financial.affordability.monthlyRepayment)}/mo</p>
                    </div>
                  </div>
                  {f.financial.affordability.assumptions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current/10">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">Assumptions</p>
                      <ul className="text-[10px] text-muted-foreground space-y-0.5">
                        {f.financial.affordability.assumptions.map((a, i) => (
                          <li key={i}>• {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3">
              <DataConfidenceBadge type="verified" />
              <p className="text-[11px] text-muted-foreground mt-1">
                Financial calculations are deterministic and based on PMEGP/MUDRA scheme rules
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Decision Section */}
        <div className="mt-8 rounded-2xl border-2 border-border bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0",
              f.verdict === "good" ? "bg-emerald-50" : f.verdict === "caution" ? "bg-amber-50" : "bg-red-50",
            )}>
              <span className="text-3xl">{getVerdictIcon(f.verdict)}</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Final Decision
              </p>
              <h2 className={cn("text-2xl sm:text-3xl font-bold mt-1", getVerdictColor(f.verdict))}>
                {f.verdict === "good" ? "GOOD TO GO" : f.verdict === "caution" ? "PROCEED CAREFULLY" : "CONSIDER AN ALTERNATIVE"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">{f.decision.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Why */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Why this recommendation?
              </h3>
              <ul className="space-y-2">
                {f.decision.whyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Watch out */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Watch out for
              </h3>
              <ul className="space-y-2">
                {f.decision.watchOuts.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Financial fit */}
          <div className="mt-6 rounded-xl bg-[#F4F8EF] border border-border/60 p-4">
            <p className="text-xs font-semibold text-foreground mb-1">Financial Fit</p>
            <p className="text-sm text-muted-foreground">{f.decision.financialFit}</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 rounded-2xl border border-border bg-white p-6 sm:p-8">
          <h3 className="text-lg font-bold text-foreground mb-1">Next Steps</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Here's what you should do next to move forward with your business idea.
          </p>
          <div className="space-y-3">
            {f.nextSteps.map((step, i) => (
              <label
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="text-sm text-foreground group-hover:text-foreground/90">
                  {step}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 mb-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Run Another Assessment
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ─── Reusable Section Card ─── */
function SectionCard({
  icon,
  title,
  badge,
  badgeType,
  score,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeType?: "verified" | "estimated" | "ai";
  score?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-white p-5 sm:p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        {score !== undefined && (
          <div className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            score >= 70 ? "bg-emerald-50 text-emerald-600" : score >= 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600",
          )}>
            {score}
          </div>
        )}
        {badge && (
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
              badgeType === "ai"
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : badgeType === "verified"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-amber-50 text-amber-600 border-amber-200",
            )}
          >
            {badgeType === "ai" ? "🤖 " : badgeType === "verified" ? "✓ " : "≈ "}
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── Metric Block ─── */
function MetricBlock({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-3 text-center",
        highlight
          ? "bg-primary/5 border border-primary/10"
          : "bg-muted/50",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn(
        "text-lg font-bold mt-1",
        highlight ? "text-primary" : "text-foreground",
      )}>
        {value}
      </p>
    </div>
  );
}
