import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { ProgressStepper } from "@/components/ui/ProgressStepper";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useOnboarding } from "@/lib/onboarding-context";
import { generateFeasibility } from "@/data/feasibility";
import { locations, type Location } from "@/data/locations";
import { businessCategories, type BusinessCategory } from "@/data/businesses";
import { formatIndianCurrency } from "@/data/assessment";
import { getRecommendations } from "@/data/recommendations";
import {
  MapPin,
  Search,
  Store,
  Lightbulb,
  IndianRupee,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Check,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 0, label: "Location" },
  { id: 1, label: "Business" },
  { id: 2, label: "Capital" },
  { id: 3, label: "Review" },
];

const QUICK_AMOUNTS = [
  { label: "₹50K", value: 50000 },
  { label: "₹1L", value: 100000 },
  { label: "₹2L", value: 200000 },
  { label: "₹5L", value: 500000 },
];

const RADIUS_OPTIONS = [5, 10];

function OnboardingInner() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const {
    location,
    setLocation,
    radius,
    setRadius,
    business,
    setBusiness,
    capital,
    setCapital,
    setFeasibility,
    isAnalyzing,
    setIsAnalyzing,
  } = useOnboarding();

  const [locationSearch, setLocationSearch] = useState("");
  const [businessSearch, setBusinessSearch] = useState("");
  const [capitalError, setCapitalError] = useState("");

  const filteredLocations = useMemo(() => {
    if (!locationSearch) return locations;
    const q = locationSearch.toLowerCase();
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        l.pincode.includes(q),
    );
  }, [locationSearch]);

  const filteredBusinesses = useMemo(() => {
    if (!businessSearch) return businessCategories;
    const q = businessSearch.toLowerCase();
    return businessCategories.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q),
    );
  }, [businessSearch]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return location !== null;
      case 1: return business !== null;
      case 2: return capital > 0;
      case 3: return true;
      default: return false;
    }
  }, [step, location, business, capital]);

  const handleNext = useCallback(() => {
    if (step === 2 && capital <= 0) {
      setCapitalError("Please enter a valid amount");
      return;
    }
    if (step < 3) setStep(step + 1);
  }, [step, capital]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleAnalyze = useCallback(async () => {
    if (!business || !location) return;
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const feasibility = generateFeasibility(business.id, capital, location.id);
    setFeasibility(feasibility);
    setIsAnalyzing(false);
    navigate("/dashboard");
  }, [business, location, capital, navigate, setFeasibility, setIsAnalyzing]);

  if (isAnalyzing) {
    return <AnalysisLoader businessName={business?.name || "Your business"} locationName={location?.name || ""} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simplified onboarding header */}
      <div className="border-b border-border/50 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary font-serif-display">RuralBiz AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Exit
            </button>
          </div>
        </div>
        {/* Progress stepper */}
        <div className="px-4 pb-3">
          <ProgressStepper steps={STEPS} currentStep={step} />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-2xl">
          {step === 0 && (
            <LocationStep
              search={locationSearch}
              onSearchChange={setLocationSearch}
              locations={filteredLocations}
              selected={location}
              onSelect={setLocation}
              radius={radius}
              onRadiusChange={setRadius}
            />
          )}
          {step === 1 && (
            <BusinessStep
              search={businessSearch}
              onSearchChange={setBusinessSearch}
              businesses={filteredBusinesses}
              selected={business}
              onSelect={setBusiness}
              location={location}
            />
          )}
          {step === 2 && (
            <CapitalStep
              value={capital}
              onChange={(v) => {
                setCapital(v);
                setCapitalError("");
              }}
              error={capitalError}
            />
          )}
          {step === 3 && (
            <ReviewStep
              location={location}
              radius={radius}
              business={business}
              capital={capital}
              onEditLocation={() => setStep(0)}
              onEditBusiness={() => setStep(1)}
              onEditCapital={() => setStep(2)}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border/50 bg-white py-4 px-4 sticky bottom-0">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all",
                canProceed
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Analyze My Business
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Location ─── */
function LocationStep({
  search, onSearchChange, locations: locs, selected, onSelect, radius, onRadiusChange,
}: {
  search: string; onSearchChange: (s: string) => void; locations: Location[];
  selected: Location | null; onSelect: (l: Location | null) => void;
  radius: number; onRadiusChange: (r: number) => void;
}) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <MapPin className="h-6 w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold">
          Where do you want to start your business?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select your village, town or block — we will analyze the local market around it
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by village, town, district or PIN code..."
          className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="max-h-[280px] overflow-y-auto rounded-xl border border-border mb-4 divide-y divide-border/50">
        {locs.map((loc) => (
          <button
            key={loc.id}
            onClick={() => onSelect(loc)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-muted/50",
              selected?.id === loc.id && "bg-primary/5 border-l-2 border-primary",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                selected?.id === loc.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{loc.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {loc.district}, {loc.state} • {loc.pincode}
              </p>
            </div>
            {selected?.id === loc.id && (
              <Check className="h-4 w-4 text-primary flex-shrink-0" style={{ animation: "checkPop 0.3s ease-out" }} />
            )}
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {loc.type}
            </span>
          </button>
        ))}
        {locs.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No locations found. Try a different search.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-[#F4F8EF] h-40 flex items-center justify-center mb-4">
        <div className="text-center">
          <MapPin className="h-6 w-6 text-primary/40 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">
            {selected
              ? `Map area: ${selected.name}, ${selected.district} (${radius} km radius)`
              : "Select a location to see the map area"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2">Analysis radius</p>
        <div className="flex gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => onRadiusChange(r)}
              className={cn(
                "flex-1 rounded-xl border py-3 text-sm font-semibold transition-all",
                radius === r
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Business with AI Recommendations ─── */
function BusinessStep({
  search, onSearchChange, businesses, selected, onSelect, location,
}: {
  search: string; onSearchChange: (s: string) => void;
  businesses: BusinessCategory[]; selected: BusinessCategory | null;
  onSelect: (b: BusinessCategory | null) => void;
  location: Location | null;
}) {
  const recommendations = useMemo(
    () => (location ? getRecommendations(location) : []),
    [location],
  );

  const rankEmoji = ["🥇", "🥈", "🥉"];
  const rankColors = [
    "from-emerald-50 to-emerald-100/50 border-emerald-300",
    "from-blue-50 to-blue-100/50 border-blue-200",
    "from-amber-50 to-amber-100/50 border-amber-200",
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <Store className="h-6 w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold">
          What business are you planning?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick the category that best describes what you want to start
        </p>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && !search && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Businesses that may work well in {location?.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Based on your selected location and available market information
          </p>
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <button
                key={rec.business.id}
                onClick={() => onSelect(rec.business)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-md",
                  selected?.id === rec.business.id
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : cn("bg-gradient-to-r border", rankColors[rec.rank - 1] || rankColors[2]),
                )}
              >
                <span className="text-2xl flex-shrink-0">{rankEmoji[rec.rank - 1]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{rec.business.name}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      rec.competitionLevel === "low" ? "bg-emerald-100 text-emerald-700" :
                      rec.competitionLevel === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700",
                    )}>
                      {rec.competitionLevel} competition
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{rec.opportunityScore}</span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
                {selected?.id === rec.business.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" style={{ animation: "checkPop 0.3s ease-out" }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {recommendations.length > 0 && !search && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Explore all categories</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search businesses..."
          className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Business grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {businesses.map((biz) => (
          <button
            key={biz.id}
            onClick={() => onSelect(biz)}
            className={cn(
              "flex flex-col items-center rounded-xl border p-4 text-center transition-all",
              selected?.id === biz.id
                ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                : "border-border hover:border-primary/40 bg-white hover:shadow-md",
            )}
          >
            <span className="text-3xl mb-2">{biz.icon}</span>
            <span className="text-sm font-semibold text-foreground">{biz.name}</span>
            <span className="text-[10px] text-primary/60 font-medium mt-0.5">{biz.nameHi}</span>
            <span className="text-[11px] text-muted-foreground mt-1 leading-tight line-clamp-2">{biz.description}</span>
            {selected?.id === biz.id && (
              <Check className="h-4 w-4 text-primary mt-2" style={{ animation: "checkPop 0.3s ease-out" }} />
            )}
          </button>
        ))}
      </div>

      {/* Not sure */}
      <button
        onClick={() =>
          onSelect({
            id: "suggest", name: "Not Sure — Suggest for Me", nameHi: "पता नहीं — सुझाएं",
            icon: "💡", description: "Let us help you find the best business for your location",
            descriptionHi: "हम आपके स्थान के लिए सर्वोत्तम व्यवसाय खोजने में मदद करेंगे",
            avgInvestment: "TBD", category: "other",
          })
        }
        className={cn(
          "w-full rounded-xl border-2 border-dashed border-primary/30 p-4 text-center transition-all hover:border-primary/60 hover:bg-primary/5",
          selected?.id === "suggest" && "border-primary bg-primary/5",
        )}
      >
        <Lightbulb className="h-5 w-5 text-primary mx-auto mb-1" />
        <span className="text-sm font-semibold text-primary">I'm not sure — suggest a business for me</span>
        <span className="block text-xs text-muted-foreground mt-0.5">We'll recommend based on your location</span>
      </button>
    </div>
  );
}

/* ─── Step 3: Capital with dynamic financing preview ─── */
function CapitalStep({ value, onChange, error }: { value: number; onChange: (v: number) => void; error: string }) {
  const projectCost = value / 0.1;
  const loanAmount = Math.min(projectCost * 0.9, projectCost > 140000 ? 4500000 : 125000);
  const showPreview = value > 0;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <IndianRupee className="h-6 w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold">
          How much can you contribute?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          This is the amount you can invest from your own savings. We'll use it to estimate financing options and financial feasibility.
        </p>
      </div>

      <div className="mb-4">
        <CurrencyInput value={value} onChange={onChange} />
        {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
      </div>

      <div className="flex gap-2 justify-center mb-6">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt.value}
            onClick={() => onChange(amt.value)}
            className={cn(
              "rounded-full border px-5 py-2.5 text-sm font-semibold transition-all",
              value === amt.value
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {amt.label}
          </button>
        ))}
      </div>

      {/* Dynamic financing preview */}
      {showPreview && (
        <div className="rounded-xl bg-[#F4F8EF] border border-border/60 p-4 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            💡 With a <span className="font-semibold text-foreground">{formatIndianCurrency(value)}</span> contribution, your estimated project cost may be around{" "}
            <span className="font-semibold text-foreground">{formatIndianCurrency(projectCost)}</span>, with potential financing of up to{" "}
            <span className="font-semibold text-primary">{formatIndianCurrency(loanAmount)}</span>, depending on your business type and applicable schemes.
          </p>
        </div>
      )}

      {!showPreview && (
        <div className="rounded-xl bg-muted/50 border border-border/60 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Don't worry about the exact amount. You can always adjust this later. We'll show you loan options based on your contribution.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Step 4: Review ─── */
function ReviewStep({ location, radius, business, capital, onEditLocation, onEditBusiness, onEditCapital }: {
  location: Location | null; radius: number; business: BusinessCategory | null;
  capital: number; onEditLocation: () => void; onEditBusiness: () => void; onEditCapital: () => void;
}) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold">Review Your Selection</h2>
        <p className="mt-2 text-sm text-muted-foreground">Double-check everything before we run the analysis</p>
      </div>

      <div className="space-y-3">
        <ReviewRow
          icon={<MapPin className="h-4 w-4" />}
          label="Location"
          value={location ? `${location.name}, ${location.district}, ${location.state}` : "Not selected"}
          sub={location ? `${radius} km analysis radius` : undefined}
          onEdit={onEditLocation}
        />
        <ReviewRow
          icon={<Store className="h-4 w-4" />}
          label="Business"
          value={business ? `${business.icon} ${business.name}` : "Not selected"}
          sub={business?.description}
          onEdit={onEditBusiness}
        />
        <ReviewRow
          icon={<IndianRupee className="h-4 w-4" />}
          label="Your Contribution"
          value={capital > 0 ? formatIndianCurrency(capital) : "Not entered"}
          sub="Amount you can contribute from savings"
          onEdit={onEditCapital}
        />
      </div>
    </div>
  );
}

function ReviewRow({ icon, label, value, sub, onEdit }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition-all hover:shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      <button onClick={onEdit} className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
        <Edit3 className="h-3 w-3" />
        Edit
      </button>
    </div>
  );
}

/* ─── Professional Analysis Loading Experience ─── */
function AnalysisLoader({ businessName, locationName }: { businessName: string; locationName: string }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = [
    `Understanding your location (${locationName})`,
    "Analyzing local market reach",
    "Studying existing competition",
    "Evaluating business opportunity",
    "Calculating financial feasibility",
    "Preparing your recommendation",
  ];

  useEffect(() => {
    const totalDuration = 2800;
    const stepDelay = totalDuration / steps.length;

    steps.forEach((_, i) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, i]);
        setProgress(((i + 1) / steps.length) * 100);
      }, 400 + i * stepDelay);
    });

    setTimeout(() => {
      setShowComplete(true);
    }, 400 + steps.length * stepDelay + 400);
  }, []);

  if (showComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="rounded-2xl border border-border bg-white p-10 shadow-xl">
            <div className="h-16 w-16 rounded-full bg-emerald-100 mx-auto mb-4 flex items-center justify-center" style={{ animation: "checkPop 0.5s ease-out" }}>
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground font-serif-display">Analysis Ready</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your {businessName} feasibility report is ready. Taking you to the dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-xl animate-scale-in">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground font-serif-display">
              Analyzing Your Business
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              We're evaluating your location, market demand, competition, risks and financial fit.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((stepText, i) => {
              const isComplete = completedSteps.includes(i);
              const isCurrent = !isComplete && completedSteps.length === i;

              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300",
                    isComplete ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-40",
                  )}
                >
                  {isComplete ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100" style={{ animation: "checkPop 0.3s ease-out" }}>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                  ) : isCurrent ? (
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-border" />
                  )}
                  <span className={cn(
                    "text-sm transition-colors",
                    isComplete ? "text-foreground font-medium" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground",
                  )}>
                    {stepText}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-3">
            This usually takes a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return <OnboardingInner />;
}
