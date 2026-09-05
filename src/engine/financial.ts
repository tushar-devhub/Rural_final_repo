import type {
  LoanScheme,
  ProjectCostBreakdown,
  SchemeAssignment,
  RepaymentEntry,
  RepaymentSchedule,
  AffordabilityResult,
} from "./types";

/* ─── Loan Schemes ─── */

export const LOAN_SCHEMES: LoanScheme[] = [
  {
    id: "micro-finance",
    name: "Micro Finance",
    nameHi: "सूक्ष्म वित्त",
    maxFunding: 125000,
    interestRate: 6.5,
    tenureYears: 3,
    moratoriumMonths: 3,
    minProjectCost: 0,
    maxProjectCost: 140000,
  },
  {
    id: "term-loan",
    name: "Term Loan",
    nameHi: "ऋण पत्र",
    maxFunding: 4500000,
    interestRate: 8,
    tenureYears: 7,
    moratoriumMonths: 6,
    minProjectCost: 140001,
    maxProjectCost: 50000000,
  },
];

/* ─── Business startup cost ranges ───
 * Canonical numeric ranges for a *typical rural micro setup* per business,
 * living in the business configuration layer so cost/scale/operating models
 * all share one source of truth.
 */

export { BUSINESS_STARTUP_RANGES, startupCostRange } from "@/data/businessConfig";
export type { BusinessStartupRange } from "@/data/businessConfig";
import { startupCostRange } from "@/data/businessConfig";
import { buildCostBreakdown, type CostContext } from "./costModel";
import { buildBusinessModel } from "./businessModel";

/* ─── Project Cost Calculation ───
 * Business-context aware. No universal multiplier:
 *   • Below the typical minimum → the minimum viable setup is estimated, so a
 *     small contribution produces a small funding need, not a giant project.
 *   • Within the range → sized to the *typical setup* for this business type
 *     (the midpoint) when the contribution cannot fund it, otherwise scaled to
 *     the user's own contribution.
 *   • Above the typical maximum → capped at the typical full setup; extra
 *     contribution is treated as a buffer, funding gap = ₹0.
 */

export function calculateProjectCost(
  contribution: number,
  businessId = "other",
  options?: CostContext,
): ProjectCostBreakdown {
  let estimatedProjectCost: number;
  if (options && (options.subCategoryId || options.placeStatus || options.scaleChoice)) {
    // Ownership- and scale-aware: the transparent cost breakdown is the
    // project cost. The user's place status directly changes the total.
    estimatedProjectCost = buildCostBreakdown(businessId, options).total;
  } else {
    const { min, max } = startupCostRange(businessId);
    const typical = Math.round((min + max) / 2);
    if (contribution <= 0) {
      estimatedProjectCost = min; // no own money yet → minimum viable setup
    } else if (contribution < min) {
      estimatedProjectCost = min; // minimum viable scale for this business
    } else if (contribution < typical) {
      estimatedProjectCost = typical; // needs some financing to reach typical scale
    } else if (contribution <= max) {
      estimatedProjectCost = contribution; // own money already covers a typical setup
    } else {
      estimatedProjectCost = max; // above typical scope — capped at full typical setup
    }
  }

  const rawProjectCost = estimatedProjectCost;
  const fundingGap = Math.max(0, estimatedProjectCost - contribution);

  // Find applicable scheme for the estimated project cost
  const scheme = determineScheme(rawProjectCost);

  if (!scheme) {
    // Beyond all schemes — no applicable scheme
    return {
      entrepreneurContribution: contribution,
      rawProjectCost,
      schemeMaxFunding: 0,
      agencyFunding: 0,
      totalProjectCost: contribution > rawProjectCost ? rawProjectCost : contribution,
      isLimitExceeded: true,
    };
  }

  const isLimitExceeded = rawProjectCost > scheme.maxProjectCost;

  if (isLimitExceeded) {
    // Scheme limit exceeded — use compliant structure
    const compliantProjectCost = scheme.maxProjectCost;
    const compliantAgencyFunding = scheme.maxFunding;
    const compliantEntrepreneurContribution = compliantProjectCost - compliantAgencyFunding;

    return {
      entrepreneurContribution: contribution,
      rawProjectCost,
      schemeMaxFunding: scheme.maxFunding,
      agencyFunding: compliantAgencyFunding,
      totalProjectCost: compliantProjectCost,
      isLimitExceeded: true,
      compliantProjectCost,
      compliantAgencyFunding,
      compliantEntrepreneurContribution,
    };
  }

  // Normal case — financing is the ACTUAL gap, never manufactured.
  const agencyFunding = Math.min(fundingGap, scheme.maxFunding);

  return {
    entrepreneurContribution: contribution,
    rawProjectCost,
    schemeMaxFunding: scheme.maxFunding,
    agencyFunding,
    totalProjectCost: estimatedProjectCost,
    isLimitExceeded: false,
  };
}

/* ─── Scheme Router ─── */

export function determineScheme(projectCost: number): LoanScheme | null {
  // Check schemes in order — micro-finance first for small amounts
  for (const scheme of LOAN_SCHEMES) {
    if (projectCost >= scheme.minProjectCost && projectCost <= scheme.maxProjectCost) {
      return scheme;
    }
  }
  return null;
}

export function getSchemeAssignment(contribution: number, businessId = "other", options?: CostContext): SchemeAssignment | null {
  const projectCost = calculateProjectCost(contribution, businessId, options);
  const scheme = determineScheme(projectCost.rawProjectCost);

  if (!scheme) return null;

  return { scheme, projectCost };
}

/* ─── Loan Calculation ─── */

export function calculateLoan(
  contribution: number,
  businessId = "other",
  options?: CostContext,
): {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  moratoriumMonths: number;
  scheme: LoanScheme;
} | null {
  const assignment = getSchemeAssignment(contribution, businessId, options);
  if (!assignment) return null;

  const { scheme, projectCost } = assignment;

  return {
    loanAmount: projectCost.isLimitExceeded
      ? scheme.maxFunding
      : projectCost.agencyFunding,
    interestRate: scheme.interestRate,
    tenureYears: scheme.tenureYears,
    moratoriumMonths: scheme.moratoriumMonths,
    scheme,
  };
}

/* ─── Repayment Engine ─── */

export function calculateRepayment(
  loanAmount: number,
  annualInterestRate: number,
  tenureYears: number,
  moratoriumMonths: number,
  frequency: "monthly" | "quarterly" = "quarterly",
): RepaymentSchedule {
  const entries: RepaymentEntry[] = [];
  const periodsPerYear = frequency === "monthly" ? 12 : 4;
  const totalPeriods = tenureYears * periodsPerYear;
  const moratoriumPeriods = Math.ceil((moratoriumMonths / 12) * periodsPerYear);
  const periodicRate = annualInterestRate / 100 / periodsPerYear;

  let balance = loanAmount;
  let totalPayment = 0;
  let totalInterest = 0;

  // Moratorium periods — interest accrues but no payment
  for (let i = 0; i < moratoriumPeriods; i++) {
    const interest = balance * periodicRate;
    totalInterest += interest;
    balance += interest; // Interest capitalizes during moratorium

    entries.push({
      quarter: i + 1,
      label: `Q${i + 1} — Moratorium`,
      principal: 0,
      interest: Math.round(interest),
      payment: 0,
      remainingBalance: Math.round(balance),
    });
  }

  // EMI periods
  const emiPeriods = totalPeriods - moratoriumPeriods;
  if (emiPeriods > 0 && periodicRate > 0) {
    // Standard EMI formula
    const emi =
      (balance * periodicRate * Math.pow(1 + periodicRate, emiPeriods)) /
      (Math.pow(1 + periodicRate, emiPeriods) - 1);

    for (let i = 0; i < emiPeriods; i++) {
      const interest = balance * periodicRate;
      const principal = emi - interest;
      balance -= principal;
      totalPayment += emi;
      totalInterest += interest;

      entries.push({
        quarter: moratoriumPeriods + i + 1,
        label: `Q${moratoriumPeriods + i + 1}`,
        principal: Math.round(principal),
        interest: Math.round(interest),
        payment: Math.round(emi),
        remainingBalance: Math.max(0, Math.round(balance)),
      });
    }
  } else if (emiPeriods > 0) {
    // Zero interest edge case
    const flatPayment = balance / emiPeriods;
    for (let i = 0; i < emiPeriods; i++) {
      balance -= flatPayment;
      totalPayment += flatPayment;
      entries.push({
        quarter: moratoriumPeriods + i + 1,
        label: `Q${moratoriumPeriods + i + 1}`,
        principal: Math.round(flatPayment),
        interest: 0,
        payment: Math.round(flatPayment),
        remainingBalance: Math.max(0, Math.round(balance)),
      });
    }
  }

  return {
    entries,
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    effectiveRate: annualInterestRate,
  };
}

/* ─── Loan Simulator ───
 * Standard amortizing loan: user can vary amount / rate / tenure and get an
 * immediate EMI + total interest + total repayment. All estimates only.
 */

export interface LoanSimulation {
  loanAmount: number;
  annualRate: number;
  tenureYears: number;
  emiMonthly: number;      // monthly EMI (₹)
  totalInterest: number;   // total interest over tenure (₹)
  totalRepayment: number;  // principal + interest (₹)
}

export function simulateLoan(
  loanAmount: number,
  annualRate: number,
  tenureYears: number,
): LoanSimulation {
  const principal = Math.max(0, loanAmount);
  const rate = Math.max(0, annualRate) / 100 / 12;
  const months = Math.max(1, Math.round(tenureYears * 12));

  let emiMonthly: number;
  if (rate > 0) {
    emiMonthly = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  } else {
    emiMonthly = principal / months;
  }

  const totalRepayment = emiMonthly * months;
  return {
    loanAmount: principal,
    annualRate,
    tenureYears,
    emiMonthly: Math.round(emiMonthly),
    totalInterest: Math.round(Math.max(0, totalRepayment - principal)),
    totalRepayment: Math.round(totalRepayment),
  };
}

/* ─── EMI Stress Test ───
 * Compares monthly EMI against estimated operating profit and classifies
 * repayment pressure LOW / MEDIUM / HIGH — never a guarantee.
 */

export interface RepaymentStress {
  level: "low" | "medium" | "high";
  label: string;
  ratio: number; // emi / operating profit
  explanation: string;
}

export function repaymentStress(emiMonthly: number, operatingProfit: number): RepaymentStress {
  if (emiMonthly <= 0) {
    return {
      level: "low",
      label: "LOW REPAYMENT PRESSURE",
      ratio: 0,
      explanation: "No loan repayment is estimated — the business does not depend on external financing.",
    };
  }
  if (operatingProfit <= 0) {
    return {
      level: "high",
      label: "HIGH REPAYMENT PRESSURE",
      ratio: 0,
      explanation: "The estimated operating profit is negative or zero, so any loan repayment would consume the entire cash flow. Reconsider the loan amount or start at a smaller scale.",
    };
  }
  const ratio = emiMonthly / operatingProfit;
  let level: "low" | "medium" | "high";
  let explanation: string;
  if (ratio <= 0.3) {
    level = "low";
    explanation = `EMI is about ${Math.round(ratio * 100)}% of the estimated operating profit — repayment pressure is low and most of the profit stays in the business.`;
  } else if (ratio <= 0.5) {
    level = "medium";
    explanation = `EMI is about ${Math.round(ratio * 100)}% of the estimated operating profit — repayment is manageable but leaves a thinner buffer for shocks.`;
  } else {
    level = "high";
    explanation = `EMI is about ${Math.round(ratio * 100)}% of the estimated operating profit — repayment would consume a large share of profit. A smaller loan or longer tenure is worth considering.`;
  }
  return { level, label: `${level.toUpperCase()} REPAYMENT PRESSURE`, ratio, explanation };
}

/* ─── Recommended Borrowing Range ───
 * The *required* loan is simply the funding gap, but we do not encourage
 * borrowing the full gap blindly. The *recommended* range is bounded by:
 *   • lower bound — enough to cover the unavoidable gap
 *   • upper bound — the largest loan whose monthly EMI stays within ~40% of
 *     the estimated operating profit (a common affordability guideline), so
 *     repayment does not swallow the business's cash flow.
 */

export interface RecommendedLoan {
  requiredLoan: number;
  rangeLow: number;
  rangeHigh: number;
  reasoning: string[];
}

export function recommendedLoan(
  fundingGap: number,
  operatingProfit: number,
  annualRate: number,
  tenureYears: number,
): RecommendedLoan {
  const requiredLoan = Math.max(0, fundingGap);
  const reasoning: string[] = [];
  if (requiredLoan <= 0) {
    return {
      requiredLoan: 0,
      rangeLow: 0,
      rangeHigh: 0,
      reasoning: [
        "Your available funding covers the estimated project cost — no external borrowing is required.",
        "Avoid taking a loan if you do not need one.",
      ],
    };
  }

  // Largest loan whose EMI stays within 40% of operating profit.
  const affordableEmi = operatingProfit * 0.4;
  let affordableLoan = requiredLoan;
  if (affordableEmi > 0) {
    const monthlyRate = Math.max(0, annualRate) / 100 / 12;
    const months = Math.max(1, Math.round(tenureYears * 12));
    if (monthlyRate > 0) {
      affordableLoan = (affordableEmi * (Math.pow(1 + monthlyRate, months) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, months));
    } else {
      affordableLoan = affordableEmi * months;
    }
  }

  const rangeHigh = Math.min(requiredLoan, Math.max(0, Math.floor(affordableLoan / 1000) * 1000));
  const rangeLow = Math.round(Math.min(requiredLoan, rangeHigh * 0.6) / 1000) * 1000;

  if (rangeHigh >= requiredLoan * 0.95) {
    reasoning.push(`The funding gap of ₹${requiredLoan.toLocaleString("en-IN")} fits within your estimated repayment capacity — borrowing the full gap appears manageable under current assumptions.`);
  } else {
    reasoning.push(`Borrowing the full ₹${requiredLoan.toLocaleString("en-IN")} gap would make EMI heavy. A recommended borrowing range of ₹${rangeLow.toLocaleString("en-IN")} – ₹${rangeHigh.toLocaleString("en-IN")} keeps the estimated EMI within ~40% of operating profit.`);
    reasoning.push("Cover the remaining gap by increasing own capital, other funding, or starting at a smaller scale.");
  }
  reasoning.push("All figures are estimates for decision support — verify with the lender before committing.");

  return { requiredLoan, rangeLow, rangeHigh, reasoning };
}

/* ─── Affordability ─── */

export function calculateAffordability(
  contribution: number,
  businessId: string,
  _locationId: string,
  options?: CostContext,
): AffordabilityResult {
  let expectedMonthlyRevenue: number;
  let operatingCosts: number;

  if (options && (options.subCategoryId || options.placeStatus || options.scaleChoice)) {
    // Sub-category / ownership / scale aware — same operating model the
    // profit timeline and scale analysis use.
    const model = buildBusinessModel(businessId, contribution, options);
    expectedMonthlyRevenue = model.monthlyRevenue;
    operatingCosts = model.monthlyExpenses;
  } else {
    // Deterministic revenue/cost estimates by business type
    const estimates: Record<string, { revenue: [number, number]; costs: number }> = {
      dairy: { revenue: [35000, 55000], costs: 22000 },
      grocery: { revenue: [30000, 50000], costs: 20000 },
      poultry: { revenue: [40000, 70000], costs: 28000 },
      "poultry-feed": { revenue: [25000, 45000], costs: 15000 },
      clothing: { revenue: [20000, 40000], costs: 12000 },
      "mobile-repair": { revenue: [15000, 30000], costs: 8000 },
      "food-processing": { revenue: [30000, 60000], costs: 20000 },
      "agri-inputs": { revenue: [35000, 55000], costs: 22000 },
      retail: { revenue: [25000, 45000], costs: 15000 },
      services: { revenue: [15000, 35000], costs: 8000 },
      manufacturing: { revenue: [40000, 80000], costs: 30000 },
    };
    const est = estimates[businessId] || { revenue: [20000, 40000], costs: 15000 };
    expectedMonthlyRevenue = Math.round((est.revenue[0] + est.revenue[1]) / 2);
    operatingCosts = est.costs;
  }

  const monthlyCashFlow = expectedMonthlyRevenue - operatingCosts;

  // Calculate monthly repayment from loan (business-aware — loan is the real gap)
  const loanInfo = calculateLoan(contribution, businessId, options);
  let monthlyRepayment = 0;

  if (loanInfo) {
    const schedule = calculateRepayment(
      loanInfo.loanAmount,
      loanInfo.interestRate,
      loanInfo.tenureYears,
      loanInfo.moratoriumMonths,
      "quarterly",
    );

    // Average quarterly payment / 3 for monthly
    const payingEntries = schedule.entries.filter((e) => e.payment > 0);
    if (payingEntries.length > 0) {
      const avgQuarterly =
        payingEntries.reduce((sum, e) => sum + e.payment, 0) / payingEntries.length;
      monthlyRepayment = Math.round(avgQuarterly / 3);
    }
  }

  const surplusOrDeficit = monthlyCashFlow - monthlyRepayment;

  let rating: "comfortable" | "tight" | "risky";
  let ratingLabel: string;
  let ratingIcon: string;

  const ratio = monthlyRepayment > 0 ? surplusOrDeficit / monthlyRepayment : 1;

  if (monthlyRepayment <= 0) {
    // No financing needed — there is no repayment burden to assess, so the
    // monthly cash flow is simply surplus.
    rating = "comfortable";
    ratingLabel = "Comfortable";
    ratingIcon = "🟢";
  } else if (ratio >= 1.5) {
    rating = "comfortable";
    ratingLabel = "Comfortable";
    ratingIcon = "🟢";
  } else if (ratio >= 0.5) {
    rating = "tight";
    ratingLabel = "Tight";
    ratingIcon = "🟡";
  } else {
    rating = "risky";
    ratingLabel = "Risky";
    ratingIcon = "🔴";
  }

  const assumptions = [
    "Revenue estimate is based on typical performance for this business type in similar locations.",
    "Operating costs include raw materials, utilities, transport and basic overheads.",
    "Loan repayment starts after the moratorium period.",
    "Actual revenue may vary based on location, season and management.",
  ];

  return {
    expectedMonthlyRevenue,
    operatingCosts,
    monthlyCashFlow,
    monthlyRepayment,
    surplusOrDeficit,
    rating,
    ratingLabel,
    ratingIcon,
    assumptions,
  };
}
