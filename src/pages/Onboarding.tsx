import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PreWorkOnboarding from "@/components/onboarding/PreWorkOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const { user } = useAuth();
  const [shouldShowOnboarding, setShouldShowOnboarding] =
    useState<boolean>(true);

  // Removed useEffect that checked for saved onboarding and redirected to /work.
  // We want onboarding to run every time.

  const handleComplete = async (data: OnboardingData) => {
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

    // Sync to Database if user is logged in
    if (user) {
      try {
        await supabase.from("onboarding_preferences").upsert(
          {
            user_id: user.id,
            energy_level: data.energy,
            pressure_preference: data.pressure,
            initial_intent: data.intent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        // We do NOT set is_tutorial_seen to true here, accessing /work will handle that logic (if it shows tutorial and completes)
      } catch (error) {
        console.error("Failed to sync onboarding to DB:", error);
      }
    }

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
