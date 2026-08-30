import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  MapPin,
  Store,
  IndianRupee,
  BarChart3,
  ShieldCheck,
  Target,
  TrendingUp,
  AlertTriangle,
  Users,
  Lightbulb,
  ArrowUpRight,
  Check,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";

/* ─── Hero Section ─── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EDF3E3] via-[#F4F8EF] to-white">
      {/* Decorative soft gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,230,77,0.15),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Business Advisory
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            Turn Your Business Idea Into a{" "}
            <span className="italic text-primary">Smarter Decision</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Understand your local market, competition, risks and financing options
            before you invest your hard-earned money.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/onboarding"
              className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Check My Business Idea
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[11px] transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              See How It Works
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Product Visualization */}
        <div className="mt-14 sm:mt-20 mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border/60 bg-white/90 backdrop-blur-sm p-5 sm:p-8 shadow-xl shadow-black/5">
            {/* Flow visualization */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3">
              <FlowCard
                icon={<MapPin className="h-5 w-5" />}
                title="Location"
                desc="Rampur, UP"
              />
              <Arrow />
              <FlowCard
                icon={<Store className="h-5 w-5" />}
                title="Business"
                desc="Dairy Farm"
              />
              <Arrow />
              <FlowCard
                icon={<IndianRupee className="h-5 w-5" />}
                title="Capital"
                desc="₹2,00,000"
              />
              <Arrow className="hidden sm:flex" />
              <div className="hidden sm:block">
                <FlowResult score={78} verdict="Good Potential" />
              </div>
            </div>
            <div className="sm:hidden mt-4">
              <FlowResult score={78} verdict="Good Potential" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#F4F8EF] px-4 py-3 min-w-[140px]">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="text-sm font-bold text-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <div className={`text-primary/30 ${className}`}>
      <ChevronRight className="h-5 w-5 rotate-90 sm:rotate-0" />
    </div>
  );
}

function FlowResult({ score, verdict }: { score: number; verdict: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200/60 px-5 py-3 min-w-[180px]">
      <div className="text-center">
        <span className="text-2xl font-bold text-emerald-600">{score}</span>
        <span className="text-xs text-emerald-500 block">/ 100</span>
      </div>
      <div className="border-l border-emerald-200 pl-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600/70">
          AI Analysis
        </p>
        <p className="text-sm font-bold text-emerald-700">🟢 {verdict}</p>
      </div>
    </div>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Choose Location",
      titleHi: "स्थान चुनें",
      desc: "Select your village, town or block where you want to start your business.",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      num: "02",
      title: "Tell Us Your Business",
      titleHi: "अपना व्यवसाय बताएं",
      desc: "Choose from 12+ business categories or tell us your unique idea.",
      icon: <Store className="h-5 w-5" />,
    },
    {
      num: "03",
      title: "Enter Your Capital",
      titleHi: "अपनी पूंजी दर्ज करें",
      desc: "Tell us how much you can contribute from your own savings.",
      icon: <IndianRupee className="h-5 w-5" />,
    },
    {
      num: "04",
      title: "Get Your Decision",
      titleHi: "अपना निर्णय प्राप्त करें",
      desc: "Receive a complete feasibility analysis with clear recommendations.",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold">
            How It <span className="italic text-primary">Works</span>
          </h2>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4">
          {/* Connection line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-border" />

          {steps.map((step) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#F4F8EF] border border-border/60 mb-4">
                <div className="flex flex-col items-center">
                  <div className="text-primary">{step.icon}</div>
                  <span className="mt-1 text-[10px] font-bold text-primary/60">
                    {step.num}
                  </span>
                </div>
              </div>
              <h3 className="text-base font-bold text-foreground">{step.title}</h3>
              <p className="text-xs text-primary/60 font-medium mt-0.5">{step.titleHi}</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── What We Analyze ─── */
function WhatWeAnalyze() {
  const pillars = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Market Reach",
      desc: "How many customers can you realistically reach from your location?",
      color: "bg-blue-50 text-blue-600 border-blue-200/60",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Opportunity",
      desc: "What gaps exist in the local market that your business can fill?",
      color: "bg-amber-50 text-amber-600 border-amber-200/60",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "SWOT Analysis",
      desc: "Personalized strengths, weaknesses, opportunities and threats.",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Local Risks",
      desc: "Key risks in your area with severity, impact and mitigations.",
      color: "bg-red-50 text-red-600 border-red-200/60",
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Competition",
      desc: "Who are your competitors, how many exist, and where are they?",
      color: "bg-purple-50 text-purple-600 border-purple-200/60",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Product Pricing",
      desc: "Regional pricing data and recommended pricing for your products.",
      color: "bg-cyan-50 text-cyan-600 border-cyan-200/60",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-gradient-to-b from-white to-[#F4F8EF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Comprehensive Analysis
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold">
            What We <span className="italic text-primary">Analyze</span>
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Your analysis combines location, business and available capital.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 hover:shadow-lg hover:shadow-black/5 transition-all group"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${p.color} mb-3`}
              >
                {p.icon}
              </div>
              <h3 className="text-base font-bold text-foreground mb-1.5">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Financial Planning Section ─── */
function FinancialPlanning() {
  const items = [
    {
      icon: <IndianRupee className="h-5 w-5" />,
      title: "Smart Capital Planning",
      desc: "See exactly how your contribution connects to loan amounts, government schemes, and monthly repayment plans.",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Revenue Estimates",
      desc: "Get projected monthly revenue ranges based on local market data and realistic business assumptions.",
    },
    {
      icon: <Check className="h-5 w-5" />,
      title: "GO / CAUTION / RETHINK",
      desc: "A clear, honest recommendation so you know whether to proceed, be careful, or consider alternatives.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Financial Clarity
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Complete Financial{" "}
              <span className="italic text-primary">Planning</span> for Your Business
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              From your initial contribution to government loan schemes, we help
              you understand every rupee before you invest.
            </p>
            <Link
              to="/onboarding"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Your Analysis
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-border/60 bg-[#F4F8EF] p-5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Section ─── */
function TrustSection() {
  return (
    <section id="trust" className="py-16 sm:py-24 bg-[#F4F8EF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Trusted & <span className="italic text-primary">Transparent</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
            Recommendations are based on available data, estimates and defined rules. Verify
            critical financial and regulatory information before making investment decisions.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "✓", label: "Data-driven insights", desc: "Based on real market data" },
              { icon: "≈", label: "Clearly marked estimates", desc: "We never hide uncertainty" },
              { icon: "🛡️", desc: "Your data stays with you", label: "Privacy-first approach" },
            ].map((t) => (
              <div
                key={t.label}
                className="rounded-2xl border border-border/60 bg-white p-5 text-center"
              >
                <div className="text-2xl mb-2">{t.icon}</div>
                <h4 className="text-sm font-bold text-foreground">{t.label}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCTA() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-[#F4F8EF] to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-primary p-8 sm:p-14 text-center text-primary-foreground overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,230,77,0.12),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">
              Ready to Check Your Business Idea?
            </h2>
            <p className="text-primary-foreground/70 text-sm sm:text-base max-w-lg mx-auto mb-8">
              Take the first step toward a smarter business decision. It takes less
              than 3 minutes.
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-bold text-primary hover:bg-white/90 transition-all shadow-lg"
            >
              Check My Business Idea
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px]">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Landing Page ─── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <WhatWeAnalyze />
        <FinancialPlanning />
        <TrustSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
