export interface FeasibilityData {
  overallScore: number;
  verdict: "good" | "caution" | "rethink";
  verdictLabel: string;
  marketReach: {
    population: number;
    households: number;
    potentialCustomers: number;
    nearbyVillages: number;
    customerGroups: string[];
    distributionChannels: string[];
    summary: string;
  };
  opportunity: {
    existingBusinesses: { name: string; count: number }[];
    underserved: string;
    alternatives: string[];
    summary: string;
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
  };
  financial: {
    availableContribution: number;
    totalProjectCost: number;
    potentialLoan: number;
    recommendedScheme: string;
    repayment: string;
    monthlyEstimate: string;
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

export function generateFeasibility(
  businessId: string,
  capital: number,
  _locationId: string,
): FeasibilityData {
  // Mock generation based on inputs - Phase 2 will use real calculations
  const baseScore = businessId === "poultry-feed" ? 82 : businessId === "dairy" ? 78 : businessId === "grocery" ? 74 : 70;
  const capitalBonus = capital >= 200000 ? 5 : capital >= 100000 ? 3 : 0;
  const score = Math.min(95, baseScore + capitalBonus);

  return {
    overallScore: score,
    verdict: score >= 75 ? "good" : score >= 55 ? "caution" : "rethink",
    verdictLabel: score >= 75 ? "Good Potential" : score >= 55 ? "Proceed Carefully" : "Consider Alternatives",
    marketReach: {
      population: 28500,
      households: 4200,
      potentialCustomers: 2800,
      nearbyVillages: 8,
      customerGroups: ["Daily households", "Small shopkeepers", "Farmers", "Students"],
      distributionChannels: ["Direct retail", "Wholesale market", "Home delivery", "Weekly haat"],
      summary: "Your selected location has a strong base of 4,200 households within reach. Daily essentials see the highest demand.",
    },
    opportunity: {
      existingBusinesses: [
        { name: "Grocery", count: 35 },
        { name: "Dairy", count: 18 },
        { name: "Clothing", count: 12 },
        { name: "Mobile Repair", count: 8 },
        { name: "Poultry Feed", count: 1 },
        { name: "Food Processing", count: 5 },
      ],
      underserved: "Poultry-feed retail appears underserved with only 1 existing unit serving the area.",
      alternatives: ["Organic produce", "Cold storage", "Digital services"],
      summary: "The local market shows a clear gap in poultry feed supply. High demand from nearby poultry farms.",
    },
    swot: {
      strengths: [
        "Strong reachable customer base of 4,200 households",
        "Low competition in your specific business category",
        "Good road connectivity to nearby markets",
        "Growing demand for your products",
      ],
      weaknesses: [
        "Limited cold storage facilities nearby",
        "Seasonal fluctuations in customer demand",
        "Higher transportation costs from wholesale markets",
        "Limited skilled workforce availability",
      ],
      opportunities: [
        "Government subsidies for micro-enterprises",
        "Growing digital payment adoption",
        "Expanding to nearby villages for wider reach",
        "Partnerships with local self-help groups",
      ],
      threats: [
        "New competitors may enter if the market grows",
        "Rising transportation and fuel costs",
        "Seasonal demand drops during festivals",
        "Supply chain disruptions from wholesale markets",
      ],
    },
    risks: [
      {
        id: "risk-1",
        name: "Supply Risk",
        severity: "high",
        impact: "Can stop operations temporarily",
        explanation: "Your area appears dependent on a limited number of wholesale suppliers.",
        mitigation: "Identify at least 2 alternative suppliers. Build relationships with local producers.",
      },
      {
        id: "risk-2",
        name: "Seasonal Demand",
        severity: "medium",
        impact: "Revenue may dip 20-30% during off-season",
        explanation: "Demand patterns show significant variation across months.",
        mitigation: "Diversify your product range. Offer complementary products in off-season.",
      },
      {
        id: "risk-3",
        name: "Transportation",
        severity: "medium",
        impact: "Can increase costs and delay deliveries",
        explanation: "Road conditions and distances to wholesale markets affect your margins.",
        mitigation: "Plan bulk procurement. Negotiate delivery terms with suppliers.",
      },
      {
        id: "risk-4",
        name: "Payment Collection",
        severity: "low",
        impact: "May affect short-term cash flow",
        explanation: "Some customers may prefer credit-based purchases.",
        mitigation: "Set clear payment terms. Encourage digital payments for better tracking.",
      },
    ],
    competition: {
      totalBusinesses: 18,
      density: "medium",
      competitors: [
        { name: "Sharma General Store", type: "Grocery", distance: "0.5 km" },
        { name: "Raj Dairy Farm", type: "Dairy", distance: "1.2 km" },
        { name: "Patel Traders", type: "Agriculture Inputs", distance: "0.8 km" },
        { name: "Kumar Mobile Shop", type: "Mobile Repair", distance: "0.3 km" },
        { name: "Singh Cloth House", type: "Clothing", distance: "1.5 km" },
      ],
      summary: "18 competing businesses found within your analysis radius. Competition is moderate with clear gaps in specific categories.",
    },
    pricing: {
      regionalPrice: "₹58",
      competitorRange: "₹55 – ₹64",
      recommendedPrice: "₹60",
      explanation: "Based on regional pricing data and competitor analysis, a price of ₹60 positions you competitively while maintaining healthy margins.",
    },
    financial: {
      availableContribution: capital,
      totalProjectCost: Math.round(capital * 2.5),
      potentialLoan: Math.round(capital * 1.5),
      recommendedScheme: "PMEGP (Prime Minister's Employment Generation Programme)",
      repayment: "₹4,200 / month",
      monthlyEstimate: "Expected monthly revenue: ₹35,000 – ₹50,000",
    },
    decision: {
      recommendation: score >= 75 ? "good" : score >= 55 ? "caution" : "rethink",
      whyPoints: [
        "Strong reachable customer base of 4,200 households",
        "Moderate competition with clear market gaps",
        "Financial planning appears possible with available capital",
        "Government schemes available for your business type",
      ],
      watchOuts: [
        "Supply dependency on limited wholesale markets",
        "Seasonal demand variations throughout the year",
        "Transportation costs may affect margins",
      ],
      financialFit: `With ₹${(capital / 1000).toFixed(0)}K contribution and a potential loan, your financial structure looks manageable.`,
      summary: "Your business shows good potential in the selected location. The market has room for your products and the financial structure appears viable.",
    },
    nextSteps: [
      "Validate local customer demand through direct conversations",
      "Contact and negotiate with 2-3 alternative suppliers",
      "Compare prices from nearby competitors in person",
      "Finalize your starting investment and timeline",
      "Review financing requirements and available government schemes",
      "Visit the District Industries Centre (DIC) for registration",
    ],
  };
}
