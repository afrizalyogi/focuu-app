import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PreWorkOnboarding from "@/components/onboarding/PreWorkOnboarding";

type EnergyLevel = "low" | "okay" | "high";
type PressurePreference = "push" | "steady" | "support";

interface OnboardingData {
  energy: EnergyLevel;
  pressure: PressurePreference;
  intent: string;
}

const ONBOARDING_KEY = "focuu_onboarding_completed";
const ONBOARDING_DATA_KEY = "focuu_onboarding_data";

const Onboarding = () => {
  const navigate = useNavigate();
  const [shouldShowOnboarding, setShouldShowOnboarding] =
    useState<boolean>(true);

  // Removed useEffect that checked for saved onboarding and redirected to /work.
  // We want onboarding to run every time.

  const handleComplete = (data: OnboardingData) => {
    // Map energy to session length
    const energyToMinutes: Record<EnergyLevel, number> = {
      low: 15,
      okay: 30,
      high: 45,
    };

    // Map pressure to tone mode
    const pressureToTone: Record<PressurePreference, string> = {
      push: "brutal",
      steady: "medium",
      support: "affirmative",
    };

    // Store onboarding data
    const onboardingData = {
      energy: data.energy,
      sessionLength: energyToMinutes[data.energy],
      toneMode: pressureToTone[data.pressure],
      initialTask: data.intent || null,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(ONBOARDING_KEY, "true");
    localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(onboardingData));

    // Navigate to work with the onboarding data
    navigate("/work", {
      replace: true,
      state: { fromOnboarding: true, ...onboardingData },
    });
  };

  if (shouldShowOnboarding === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return <PreWorkOnboarding onComplete={handleComplete} />;
};

export default Onboarding;

// Helper function to reset onboarding (can be called from settings)
export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
  localStorage.removeItem(ONBOARDING_DATA_KEY);
};

// Helper function to get onboarding data
export const getOnboardingData = () => {
  const data = localStorage.getItem(ONBOARDING_DATA_KEY);
  return data ? JSON.parse(data) : null;
};
