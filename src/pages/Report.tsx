import { useOnboarding } from "@/lib/onboarding-context";
import { formatIndianCurrency, getVerdictColor, getVerdictIcon } from "@/data/assessment";
import { SWOTGrid } from "@/components/ui/SWOTGrid";
import { DataConfidenceBadge } from "@/components/ui/DataConfidenceBadge";
import { matchSchemesForProfileSource, type SchemeMatch } from "@/engine/schemeMatching";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Home,
  ChevronRight,
  ArrowUpRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  Store,
  IndianRupee,
  Printer,
} from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export default function Report() {
  const { feasibility, location, business, capital, radius } = useOnboarding();

  if (!feasibility) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar variant="app" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-2">No Report Available</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Complete an assessment first to generate your business decision report.
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Assessment <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const f = feasibility;
  const schemeResult =
    feasibility && business && location
      ? matchSchemesForProfileSource({
          businessId: business.id,
          businessName: business.name,
          businessCategory: business.category,
          state: location.state,
          district: location.district,
          contribution: feasibility.financial.availableContribution || capital,
          projectCost: feasibility.financial.totalProjectCost,
          fundingRequirement: feasibility.financial.potentialLoan,
        })
      : null;
  const today = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant="app" />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-6 sm:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors"><Home className="h-3.5 w-3.5" /></Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Report</span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Report
          </button>
        </div>

        {/* Report Content */}
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-10 shadow-sm">
          {/* Header */}
          <div className="text-center border-b border-border pb-8 mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              RuralBiz AI
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Business Decision Report
            </h1>
            <p className="text-sm text-muted-foreground">AI-Driven Business Advisory & Financial Structuring</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {today}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {location?.name}, {location?.district}</span>
              <span className="flex items-center gap-1"><Store className="h-3 w-3" /> {business?.name}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <Section title="Executive Summary">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl flex-shrink-0",
                f.verdict === "good" ? "bg-emerald-50" : f.verdict === "caution" ? "bg-amber-50" : "bg-red-50",
              )}>
                <span className="text-3xl">{getVerdictIcon(f.verdict)}</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{f.overallScore}/100</p>
                <p className={cn("text-sm font-bold", getVerdictColor(f.verdict))}>{f.verdictLabel}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.decision.summary}</p>
          </Section>

          {/* Market Analysis */}
          <Section title="Market Analysis">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <StatBlock label="Population" value={f.marketReach.population.toLocaleString("en-IN")} />
              <StatBlock label="Households" value={f.marketReach.households.toLocaleString("en-IN")} />
              <StatBlock label="Potential Customers" value={f.marketReach.potentialCustomers.toLocaleString("en-IN")} />
              <StatBlock label="Nearby Villages" value={f.marketReach.nearbyVillages.toString()} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.marketReach.summary}</p>
            <div className="mt-2"><DataConfidenceBadge type="estimated" confidence={f.marketReach.confidence} /></div>
          </Section>

          {/* Opportunity */}
          <Section title="Opportunity Analysis">
            <div className="space-y-1.5 mb-3">
              {f.opportunity.existingBusinesses.map((b) => (
                <div key={b.name} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground w-28">{b.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(100, (b.count / 40) * 100)}%` }} />
                  </div>
                  <span className="font-semibold w-6 text-right">{b.count}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{f.opportunity.summary}</p>
          </Section>

          {/* SWOT */}
          <Section title="SWOT Analysis">
            <SWOTGrid
              strengths={f.swot.strengths}
              weaknesses={f.swot.weaknesses}
              opportunities={f.swot.opportunities}
              threats={f.swot.threats}
            />
          </Section>

          {/* Risks */}
          <Section title="Local Risks">
            <div className="space-y-3">
              {f.risks.map((risk) => (
                <div key={risk.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
                      risk.severity === "high" ? "bg-red-50 text-red-600 border-red-200" : risk.severity === "medium" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-600 border-emerald-200",
                    )}>{risk.severity.toUpperCase()}</span>
                    <span className="text-xs font-bold">{risk.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{risk.explanation}</p>
                  <p className="text-[11px] text-primary font-medium mt-1">Mitigation: {risk.mitigation}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Competition */}
          <Section title="Competition">
            <p className="text-xs text-muted-foreground mb-2">{f.competition.summary}</p>
            <div className="space-y-1">
              {f.competition.competitors.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-muted-foreground">{c.type} • {c.distance}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Product Pricing">
            {f.pricing.unit && <p className="text-xs text-muted-foreground mb-2">Unit: {f.pricing.unit}</p>}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatBlock label="Regional" value={f.pricing.regionalPrice} />
              <StatBlock label="Competitor Range" value={f.pricing.competitorRange} />
              <StatBlock label="Recommended" value={f.pricing.recommendedPrice} highlight />
            </div>
            <p className="text-xs text-muted-foreground">{f.pricing.explanation}</p>
          </Section>

          {/* Financial Structure */}
          <Section title="Financial Structure">
            {f.financial.projectCostBreakdown && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatBlock label="Your Contribution" value={formatIndianCurrency(f.financial.projectCostBreakdown.entrepreneurContribution)} highlight />
                <StatBlock label="Total Project Cost" value={formatIndianCurrency(f.financial.totalProjectCost)} />
                <StatBlock label="Agency Funding" value={formatIndianCurrency(f.financial.potentialLoan)} />
                <StatBlock label="Scheme" value={f.financial.recommendedScheme} />
              </div>
            )}
            {f.financial.loanDetails && (
              <div className="grid grid-cols-4 gap-3 mb-3">
                <StatBlock label="Interest" value={`${f.financial.loanDetails.interestRate}%`} />
                <StatBlock label="Tenure" value={`${f.financial.loanDetails.tenure} yrs`} />
                <StatBlock label="Moratorium" value={`${f.financial.loanDetails.moratorium} mo`} />
                <StatBlock label="Repayment" value={f.financial.repayment} />
              </div>
            )}
            {f.financial.affordability && (
              <div className={cn("rounded-lg p-3 text-xs",
                f.financial.affordability.rating === "comfortable" ? "bg-emerald-50" : f.financial.affordability.rating === "tight" ? "bg-amber-50" : "bg-red-50",
              )}>
                <p className="font-bold mb-1">{f.financial.affordability.ratingIcon} Affordability: {f.financial.affordability.ratingLabel}</p>
                <p>Revenue ₹{f.financial.affordability.expectedRevenue.toLocaleString("en-IN")} − Costs ₹{f.financial.affordability.operatingCosts.toLocaleString("en-IN")} = Cash Flow ₹{f.financial.affordability.cashFlow.toLocaleString("en-IN")}/mo</p>
                <p>Loan repayment: ₹{f.financial.affordability.monthlyRepayment.toLocaleString("en-IN")}/mo</p>
              </div>
            )}
            <div className="mt-2"><DataConfidenceBadge type="verified" /></div>

            {/* Loan application entry */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-primary/10 bg-primary/[0.03] p-3.5">
              <p className="flex-1 text-[11px] text-muted-foreground leading-relaxed">
                Use this financial structure to prepare an <span className="font-semibold text-foreground">editable loan application draft</span> (AI-generated, for preparation only).
              </p>
              <Link
                to="/application"
                className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Prepare Loan Application
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Section>

          {/* Potential Government Schemes */}
          {schemeResult && (
            <Section title="Potential Government Schemes">
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Based on your profile ({business?.name} · {location?.name}, {location?.district} · {formatIndianCurrency(f.financial.availableContribution || capital)} own capital · {formatIndianCurrency(f.financial.potentialLoan)} estimated financing need), the following programs are potentially relevant to investigate. This is a preliminary AI-assisted match — it does not confirm eligibility.
              </p>
              <div className="space-y-2.5">
                {schemeResult.matches.slice(0, 4).map((m) => (
                  <ReportSchemeRow key={m.scheme.id} m={m} />
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground/70 leading-relaxed">
                {schemeResult.disclaimer} {schemeResult.verifyNote}
              </p>
            </Section>
          )}

          {/* Final Decision */}
          <Section title="Final Decision">
            <div className={cn(
              "rounded-xl border-2 p-5 mb-4",
              f.verdict === "good" ? "border-emerald-300 bg-emerald-50" : f.verdict === "caution" ? "border-amber-300 bg-amber-50" : "border-red-300 bg-red-50",
            )}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{getVerdictIcon(f.verdict)}</span>
                <p className={cn("text-xl font-bold", getVerdictColor(f.verdict))}>
                  {f.verdict === "good" ? "GOOD TO GO" : f.verdict === "caution" ? "PROCEED CAREFULLY" : "CONSIDER AN ALTERNATIVE"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{f.decision.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Strengths</p>
                <ul className="space-y-1">{f.decision.whyPoints.map((p, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-emerald-500">•</span> {p}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> Risks</p>
                <ul className="space-y-1">{f.decision.watchOuts.map((p, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-amber-500">•</span> {p}</li>)}</ul>
              </div>
            </div>
          </Section>

          {/* Action Plan */}
          <Section title="Action Plan">
            <ol className="space-y-2">
              {f.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Disclaimer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              This report is generated by RuralBiz AI using simulated market data for demonstration purposes. Financial calculations are deterministic and based on PMEGP/MUDRA scheme rules. Recommendations should be verified with local market conditions and professional advisors before making investment decisions. RuralBiz AI does not guarantee loan approval or business success.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-3 mt-8 mb-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Back to Dashboard <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ReportSchemeRow({ m }: { m: SchemeMatch }) {
  const chip =
    m.level === "high"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : m.level === "possible"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-muted text-muted-foreground border-border";
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p className="text-xs font-bold text-foreground">{m.scheme.name}</p>
        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide ${chip}`}>
          {m.level === "high" ? "HIGH MATCH" : m.level === "possible" ? "POSSIBLE MATCH" : "LOW MATCH"}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug mt-1">{m.scheme.shortDescription}</p>
      {m.reasons.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {m.reasons.slice(0, 2).map((r, i) => (
            <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
              <span className="text-emerald-600 font-bold">✓</span> {r.text}
            </li>
          ))}
        </ul>
      )}
      {m.level !== "high" && m.gaps.length > 0 && (
        <p className="mt-1.5 text-[10px] text-amber-700 leading-snug">≈ {m.gaps[0].text}</p>
      )}
      {m.level === "low" && m.exclusions.length > 0 && (
        <p className="mt-1.5 text-[10px] text-muted-foreground leading-snug">{m.exclusions[0].text}</p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-lg p-2.5 text-center", highlight ? "bg-primary/5 border border-primary/10" : "bg-muted/50")}>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-bold mt-0.5", highlight ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}
