import { createContext, useContext, useState, type ReactNode } from "react";
import type { Location } from "@/data/locations";
import type { BusinessCategory } from "@/data/businesses";
import type { FeasibilityData } from "@/data/feasibility-types";

interface OnboardingState {
  location: Location | null;
  radius: number;
  business: BusinessCategory | null;
  capital: number;
  feasibility: FeasibilityData | null;
  isAnalyzing: boolean;
}

interface OnboardingContextType extends OnboardingState {
  setLocation: (loc: Location | null) => void;
  setRadius: (r: number) => void;
  setBusiness: (biz: BusinessCategory | null) => void;
  setCapital: (c: number) => void;
  setFeasibility: (f: FeasibilityData | null) => void;
  setIsAnalyzing: (a: boolean) => void;
  reset: () => void;
}

const defaultState: OnboardingState = {
  location: null,
  radius: 5,
  business: null,
  capital: 0,
  feasibility: null,
  isAnalyzing: false,
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState);

  const setLocation = (location: Location | null) =>
    setState((s) => ({ ...s, location }));
  const setRadius = (radius: number) =>
    setState((s) => ({ ...s, radius }));
  const setBusiness = (business: BusinessCategory | null) =>
    setState((s) => ({ ...s, business }));
  const setCapital = (capital: number) =>
    setState((s) => ({ ...s, capital }));
  const setFeasibility = (feasibility: FeasibilityData | null) =>
    setState((s) => ({ ...s, feasibility }));
  const setIsAnalyzing = (isAnalyzing: boolean) =>
    setState((s) => ({ ...s, isAnalyzing }));
  const reset = () => setState(defaultState);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setLocation,
        setRadius,
        setBusiness,
        setCapital,
        setFeasibility,
        setIsAnalyzing,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
