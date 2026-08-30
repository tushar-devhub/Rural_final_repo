export interface FeasibilityData {
  overallScore: number;
  verdict: "good" | "caution" | "rethink";
  verdictLabel: string;
  subScores: {
    marketScore: number;
    opportunityScore: number;
    competitionScore: number;
    riskScore: number;
    financialFitScore: number;
  };
  marketReach: {
    population: number;
    households: number;
    potentialCustomers: number;
    nearbyVillages: number;
    customerGroups: string[];
    distributionChannels: string[];
    summary: string;
    confidence: "high" | "medium" | "low";
  };
  opportunity: {
    existingBusinesses: { name: string; count: number }[];
    underserved: string;
    alternatives: string[];
    summary: string;
    opportunityScore: number;
    highCompetitionWarning?: string;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  risks: {
    id: string;
    name: string;
    severity: "high" | "medium" | "low";
    impact: string;
    explanation: string;
    mitigation: string;
  }[];
  competition: {
    totalBusinesses: number;
    density: "high" | "medium" | "low";
    competitors: { name: string; type: string; distance: string }[];
    summary: string;
  };
  pricing: {
    regionalPrice: string;
    competitorRange: string;
    recommendedPrice: string;
    explanation: string;
    unit?: string;
    purchasingPower?: "low" | "medium" | "high";
    demandIndicator?: "low" | "medium" | "high";
  };
  financial: {
    availableContribution: number;
    totalProjectCost: number;
    potentialLoan: number;
    recommendedScheme: string;
    repayment: string;
    monthlyEstimate: string;
    projectCostBreakdown?: {
      entrepreneurContribution: number;
      rawProjectCost: number;
      schemeMaxFunding: number;
      agencyFunding: number;
      totalProjectCost: number;
      isLimitExceeded: boolean;
      compliantProjectCost?: number;
      compliantAgencyFunding?: number;
      compliantEntrepreneurContribution?: number;
    };
    loanDetails?: {
      amount: number;
      interestRate: number;
      tenure: number;
      moratorium: number;
    } | null;
    affordability?: {
      rating: "comfortable" | "tight" | "risky";
      ratingLabel: string;
      ratingIcon: string;
      expectedRevenue: number;
      operatingCosts: number;
      cashFlow: number;
      monthlyRepayment: number;
      surplus: number;
      assumptions: string[];
    };
  };
  decision: {
    recommendation: "good" | "caution" | "rethink";
    whyPoints: string[];
    watchOuts: string[];
    financialFit: string;
    summary: string;
  };
  nextSteps: string[];
}
