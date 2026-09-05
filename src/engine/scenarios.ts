/* ────────────────────────────────────────────────────────────────────────────
 * GramUdaan — Scenario Analysis (Conservative / Expected / Optimistic)
 *
 * Built on the SAME operating model the rest of the app uses
 * (buildBusinessModel). Each scenario varies only the revenue assumption;
 * fixed costs stay constant and variable costs scale with revenue, exactly
 * like the profit timeline. All values are ESTIMATES — the optimistic case is
 * never presented as guaranteed.
 * ──────────────────────────────────────────────────────────────────────────── */

import { buildBusinessModel, type MonthProjection } from "./businessModel";
import type { CostContext } from "./costModel";

export interface ScenarioResult {
  id: "conservative" | "expected" | "optimistic";
  label: string;
  labelHi: string;
  revenueMultiplier: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  profitAfterEmi: number;      // operating profit − monthly EMI
  breakEvenMonth: number | null;
  risk: "low" | "medium" | "high";
  summary: string;
}

const SCENARIO_DEFS: { id: ScenarioResult["id"]; label: string; labelHi: string; multiplier: number }[] = [
  { id: "conservative", label: "Conservative", labelHi: "रूढ़िवादी", multiplier: 0.75 },
  { id: "expected", label: "Expected", labelHi: "अपेक्षित", multiplier: 1.0 },
  { id: "optimistic", label: "Optimistic", labelHi: "आशावादी", multiplier: 1.25 },
];

/** Ramp shape mirroring the profit timeline: starts at ~55%, reaches steady state. */
function revenueForMonth(steady: number, month: number, rampMonths: number): number {
  const t = Math.min(month, rampMonths);
  if (rampMonths <= 1) return steady;
  const progress = t / rampMonths;
  return Math.round(steady * (0.55 + 0.45 * progress));
}

function breakEvenMonthFor(
  steadyRevenue: number,
  fixedCosts: number,
  variableRatio: number,
  rampMonths: number,
): number | null {
  let cum = 0;
  for (let m = 1; m <= 12; m++) {
    const revenue = revenueForMonth(steadyRevenue, m, rampMonths);
    cum += revenue - Math.round(fixedCosts + revenue * variableRatio);
    if (cum >= 0) return m;
  }
  return null;
}

function riskForScenario(
  id: ScenarioResult["id"],
  margin: number,
  breakEvenMonth: number | null,
  profitAfterEmi: number,
): "low" | "medium" | "high" {
  if (id === "optimistic") return margin >= 25 && profitAfterEmi > 0 ? "low" : "medium";
  if (id === "expected") {
    if (margin >= 25 && profitAfterEmi > 0 && (breakEvenMonth === null || breakEvenMonth <= 8)) return "low";
    if (profitAfterEmi <= 0) return "high";
    return "medium";
  }
  // conservative
  if (profitAfterEmi <= 0) return "high";
  if (margin >= 20 && profitAfterEmi > 0) return "medium";
  return "high";
}

export interface ScenarioAnalysis {
  scenarios: ScenarioResult[];
  note: string;
}

export function buildScenarioAnalysis(
  businessId: string,
  capital: number,
  ctx: CostContext = {},
  emiMonthly = 0,
): ScenarioAnalysis {
  // Base model at the user's chosen scale — single source of truth.
  const base = buildBusinessModel(businessId, capital, ctx);
  const fixed = base.monthlyFixedCosts;
  const variableRatio = base.monthlyVariableCosts / Math.max(1, base.monthlyRevenue);
  const ramp = base.timeline.length > 0 ? base.timeline.length : 12;

  const scenarios: ScenarioResult[] = SCENARIO_DEFS.map((def) => {
    const monthlyRevenue = Math.round(base.monthlyRevenue * def.multiplier);
    const monthlyExpenses = Math.round(fixed + monthlyRevenue * variableRatio);
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const margin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;
    const profitAfterEmi = monthlyProfit - emiMonthly;
    const breakEvenMonth = breakEvenMonthFor(monthlyRevenue, fixed, variableRatio, ramp);

    let summary: string;
    if (def.id === "conservative") {
      summary = `At ${def.multiplier * 100}% of the expected revenue, monthly profit is estimated at ₹${monthlyProfit.toLocaleString("en-IN")}${emiMonthly > 0 ? `, leaving ₹${profitAfterEmi.toLocaleString("en-IN")} after the estimated EMI` : ""}.`;
    } else if (def.id === "expected") {
      summary = `At the expected revenue level, monthly profit is estimated at ₹${monthlyProfit.toLocaleString("en-IN")}${emiMonthly > 0 ? `, leaving ₹${profitAfterEmi.toLocaleString("en-IN")} after the estimated EMI` : ""}.`;
    } else {
      summary = `At ${def.multiplier * 100}% of the expected revenue, monthly profit could reach ₹${monthlyProfit.toLocaleString("en-IN")}${emiMonthly > 0 ? `, leaving ₹${profitAfterEmi.toLocaleString("en-IN")} after the estimated EMI` : ""}. This is an upper-bound estimate, not a guarantee.`;
    }

    return {
      id: def.id,
      label: def.label,
      labelHi: def.labelHi,
      revenueMultiplier: def.multiplier,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit,
      profitAfterEmi,
      breakEvenMonth,
      risk: riskForScenario(def.id, margin, breakEvenMonth, profitAfterEmi),
      summary,
    };
  });

  return {
    scenarios,
    note: "Scenarios vary only the revenue assumption around the expected level. Fixed costs stay constant and variable costs move with revenue, matching the profit timeline. They are estimates for decision support — actual results depend on local demand, season and management.",
  };
}