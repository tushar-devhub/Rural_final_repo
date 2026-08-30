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

/* ─── Project Cost Calculation ─── */

export function calculateProjectCost(contribution: number): ProjectCostBreakdown {
  // Beneficiary contribution is 10% of project cost
  // Project Cost = Contribution / 0.10
  const rawProjectCost = contribution / 0.1;

  // Find applicable scheme
  const scheme = determineScheme(rawProjectCost);

  if (!scheme) {
    // Beyond all schemes — no applicable scheme
    return {
      entrepreneurContribution: contribution,
      rawProjectCost,
      schemeMaxFunding: 0,
      agencyFunding: 0,
      totalProjectCost: contribution,
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

  // Normal case — within scheme limits
  const agencyFunding = Math.min(rawProjectCost * 0.9, scheme.maxFunding);
  const totalProjectCost = agencyFunding + contribution;

  return {
    entrepreneurContribution: contribution,
    rawProjectCost,
    schemeMaxFunding: scheme.maxFunding,
    agencyFunding,
    totalProjectCost,
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

export function getSchemeAssignment(contribution: number): SchemeAssignment | null {
  const projectCost = calculateProjectCost(contribution);
  const scheme = determineScheme(projectCost.rawProjectCost);

  if (!scheme) return null;

  return { scheme, projectCost };
}

/* ─── Loan Calculation ─── */

export function calculateLoan(contribution: number): {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  moratoriumMonths: number;
  scheme: LoanScheme;
} | null {
  const assignment = getSchemeAssignment(contribution);
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

/* ─── Affordability ─── */

export function calculateAffordability(
  contribution: number,
  businessId: string,
  _locationId: string,
): AffordabilityResult {
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

  // Use midpoint of revenue range
  const expectedMonthlyRevenue = Math.round((est.revenue[0] + est.revenue[1]) / 2);
  const operatingCosts = est.costs;

  const monthlyCashFlow = expectedMonthlyRevenue - operatingCosts;

  // Calculate monthly repayment from loan
  const loanInfo = calculateLoan(contribution);
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

  if (ratio >= 1.5) {
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
