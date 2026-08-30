import { useState, useRef, useEffect } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { formatIndianCurrency } from "@/data/assessment";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Send,
  Bot,
  User,
  ArrowUpRight,
  Home,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function getSuggestedQuestions(
  businessName: string,
  locationName: string,
  capital: number,
  verdict: string,
): string[] {
  const questions: string[] = [];

  if (verdict === "good") {
    questions.push("Why does this business show good potential?");
  } else if (verdict === "caution") {
    questions.push("What are the main risks I should watch out for?");
  } else {
    questions.push("Should I consider a different business?");
  }

  questions.push(
    `What if I invest ₹${Math.round(capital * 0.5 / 1000)}K instead of ₹${Math.round(capital / 1000)}K?`,
    "Which customer groups should I target first?",
    "Can I comfortably repay this loan?",
    `Why is competition important in ${locationName}?`,
  );

  return questions;
}

function generateAIResponse(
  question: string,
  businessName: string,
  locationName: string,
  capital: number,
  feasibility: ReturnType<typeof useOnboarding>["feasibility"],
): string {
  const q = question.toLowerCase();
  const f = feasibility;

  if (q.includes("why") && q.includes("potential")) {
    return `Based on the analysis for ${businessName} in ${locationName}:\n\nYour business shows ${f?.verdict === "good" ? "strong" : "moderate"} potential because:\n\n1. Market Reach: The area has approximately ${f?.marketReach.households?.toLocaleString("en-IN") || "4,200"} households within reach, providing a solid customer base.\n\n2. Competition: With ${f?.competition.totalBusinesses || "18"} existing competitors, the density is ${f?.competition.density || "moderate"}. ${f?.competition.density === "low" ? "This means less competition to worry about." : "You will need to differentiate your offering."}\n\n3. Financial Structure: Your ₹${(capital / 1000).toFixed(0)}K contribution through ${f?.financial.recommendedScheme || "the recommended scheme"} creates a manageable repayment structure.\n\nRemember: This analysis is based on simulated market data for demonstration purposes.`;
  }

  if (q.includes("risk") || q.includes("watch out")) {
    const risks = f?.risks || [];
    if (risks.length === 0) {
      return "The analysis did not identify major risks for this scenario. However, every business carries inherent risks such as market changes, supply disruptions, and seasonal demand variations.";
    }
    return `Here are the key risks identified for ${businessName}:\n\n${risks.map((r, i) => `${i + 1}. ${r.name} (${r.severity.toUpperCase()}): ${r.explanation}\n   Mitigation: ${r.mitigation}`).join("\n\n")}\n\nThe overall risk score is ${f?.subScores?.riskScore || "N/A"}/100. ${f?.subScores?.riskScore && f.subScores.riskScore >= 70 ? "This is within acceptable range." : "This area deserves careful attention."}`;
  }

  if (q.includes("invest") || q.includes("capital") || q.includes("₹")) {
    const newCapital = capital * 0.5;
    const projectCost = newCapital / 0.1;
    return `If you reduce your contribution to ₹${newCapital.toLocaleString("en-IN")}:\n\n• Project Cost would be: ₹${projectCost.toLocaleString("en-IN")} (at 10% contribution)\n• This falls within the ${projectCost <= 140000 ? "Micro Finance scheme (max ₹1.25L)" : "Term Loan scheme (max ₹45L)"}\n• Your loan would be approximately ₹${(projectCost * 0.9).toLocaleString("en-IN")}\n\n⚠️ A lower contribution means a smaller initial setup. Consider whether this covers your essential equipment and inventory needs.\n\nThe financial engine can recalculate this for you with exact numbers.`;
  }

  if (q.includes("customer") || q.includes("target")) {
    const groups = f?.marketReach.customerGroups || [];
    return `Based on the market analysis for ${locationName}:\n\nPrimary customer groups to target:\n${groups.map((g, i) => `${i + 1}. ${g}`).join("\n")}\n\nRecommended approach:\n• Start with the highest-relevance group (${groups[0] || "Households"})\n• Build trust through consistent quality and fair pricing\n• Expand to adjacent groups once established\n• Consider weekly haat (market day) for wider reach`;
  }

  if (q.includes("repay") || q.includes("loan") || q.includes("emi")) {
    const afford = f?.financial.affordability;
    if (!afford) {
      return "I cannot assess repayment comfort without financial data. Please run an assessment first.";
    }
    return `Repayment analysis for your ${f?.financial.recommendedScheme || "scheme"}:\n\n• Monthly Repayment: ~₹${afford.monthlyRepayment.toLocaleString("en-IN")}\n• Expected Monthly Revenue: ₹${afford.expectedRevenue.toLocaleString("en-IN")}\n• Operating Costs: ₹${afford.operatingCosts.toLocaleString("en-IN")}\n• Monthly Cash Flow: ₹${afford.cashFlow.toLocaleString("en-IN")}\n\nRating: ${afford.ratingIcon} ${afford.ratingLabel}\n\n${afford.rating === "comfortable" ? "Your expected cash flow comfortably covers the loan repayment. This is a positive sign." : afford.rating === "tight" ? "The repayment is manageable but leaves limited margin. Careful cost control will be important." : "The repayment burden is high relative to expected revenue. Consider reducing the loan amount or exploring alternative financing."}`;
  }

  if (q.includes("competition") || q.includes("competitor")) {
    return `Competition analysis for ${businessName} in ${locationName}:\n\n${f?.competition.totalBusinesses || "N"} competing businesses found within the analysis radius.\n\nCompetition density: ${f?.competition.density?.toUpperCase() || "MEDIUM"}\n\nKey competitors:\n${f?.competition.competitors.slice(0, 5).map((c) => `• ${c.name} (${c.type}) — ${c.distance}`).join("\n") || "• Analysis data loading..."}\n\nTo compete effectively:\n1. Differentiate through service quality and reliability\n2. Offer products/services competitors don't\n3. Build customer loyalty through consistent experience\n4. Consider competitive pricing for initial market entry`;
  }

  if (q.includes("different business") || q.includes("another business") || q.includes("alternative")) {
    const alts = f?.opportunity.alternatives || [];
    return `If you are considering alternatives to ${businessName}:\n\nSuggested alternatives based on your location:\n${alts.length > 0 ? alts.map((a, i) => `${i + 1}. ${a}`).join("\n") : "1. Organic produce supply\n2. Cold storage services\n3. Digital payment services"}\n\nThe market gap analysis shows: ${f?.opportunity.underserved || "underserved categories exist in your area."}\n\nYou can use the What-If Simulator to compare different business options with the same location and capital.`;
  }

  // Default response
  return `Based on your assessment of ${businessName} in ${locationName} with ₹${(capital / 1000).toFixed(0)}K contribution:\n\nThe overall feasibility score is ${f?.overallScore || "N/A"}/100 with a verdict of "${f?.verdictLabel || "Analyzing"}".\n\n${f?.decision?.summary || "The analysis covers market reach, competition, risks, financial structure and recommended next steps."}\n\nFeel free to ask about specific aspects like:\n• Market reach and customer groups\n• Competition and pricing\n• Financial structure and repayment\n• Risks and mitigations\n• Alternative business options`;
}

export default function Advisor() {
  const { feasibility, location, business, capital } = useOnboarding();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const businessName = business?.name || "your business";
  const locationName = location ? `${location.name}, ${location.district}` : "your location";
  const suggestedQuestions = getSuggestedQuestions(
    businessName,
    locationName,
    capital,
    feasibility?.verdict || "caution",
  );

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

    const response = generateAIResponse(
      question,
      businessName,
      locationName,
      capital,
      feasibility,
    );

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant="app" />

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">AI Advisor</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Business Advisor</h1>
              <p className="text-xs text-muted-foreground">
                Context-aware guidance for {businessName} in {locationName}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/60 ml-13">
            🤖 Responses are based on your assessment data. Always verify critical financial decisions.
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col rounded-2xl border border-border bg-white overflow-hidden mb-4">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[400px] max-h-[60vh]">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                  <Bot className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  Ask me anything about your business assessment
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  I understand your location, business type, capital, market data and financial structure. Ask me to explain any part of the analysis.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md",
                  )}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0 mt-1">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="px-4 pb-3 border-t border-border/50 pt-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about your business assessment..."
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  input.trim() && !isTyping
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-3 mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/what-if"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try What-If
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
