import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight, Star } from "lucide-react";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type EnergyLevel = "low" | "okay" | "high";
type PressurePreference = "push" | "steady" | "support";

interface OnboardingData {
  energy: EnergyLevel;
  pressure: PressurePreference;
  intent: string;
}

interface PreWorkOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const QUESTION_SETS = [
  {
    energy: "How's your energy right now?",
    pressure: "How should focuu work with you today?",
    intent: "What's the one thing you want to work on first?",
  },
  {
    energy: "What's your mental battery level?",
    pressure: "What kind of accountability do you need?",
    intent: "What is your main mission for this session?",
  },
  {
    energy: "How sharp do you feel?",
    pressure: "What pace should we set?",
    intent: "Define your singular focus.",
  },
];

const PreWorkOnboarding = ({ onComplete }: PreWorkOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [pressure, setPressure] = useState<PressurePreference>("steady");
  const [intent, setIntent] = useState("");
  const [rating, setRating] = useState(0);
  const { user } = useAuth();

  const { getTotalStats } = useSessionHistory();
  const stats = getTotalStats();
  const sessionCount = stats.totalSessions;

  // Randomize questions once on mount
  const questions = useMemo(() => {
    return QUESTION_SETS[Math.floor(Math.random() * QUESTION_SETS.length)];
  }, []);

  const [showRating] = useState(() => {
    // Show rating if sessions > 5 and not rated yet
    const hasRated = localStorage.getItem("focuu-rated");
    return sessionCount > 5 && !hasRated;
  });

  const handleEnergySelect = (level: EnergyLevel) => {
    setEnergy(level);
    // Auto-advance after short delay
    setTimeout(() => setStep(2), 300);
  };

  const handlePressureSelect = (pref: PressurePreference) => {
    setPressure(pref);
  };

  const handlePressureContinue = () => {
    setStep(3);
  };

  const handleSkipIntent = () => {
    if (showRating) {
      setStep(5); // Go to rating
    } else {
      setStep(4); // Go to finish
    }
  };

  const handleIntentSubmit = () => {
    if (showRating) {
      setStep(5);
    } else {
      setStep(4);
    }
  };

  const handleRatingSubmit = async () => {
    localStorage.setItem("focuu-rated", "true");

    if (user) {
      try {
        await supabase.from("user_feedback").insert({
          user_id: user.id,
          rating: rating,
          feedback: "", // Check if we want text input later
        });
      } catch (error) {
        console.error("Failed to submit rating:", error);
      }
    }

    setStep(4);
  };

  const handleFinalEnter = () => {
    onComplete({
      energy: energy || "okay",
      pressure,
      intent,
    });
  };

  // Determine total steps dynamically based on showRating
  const totalSteps = showRating ? 6 : 5;

  const renderStep = () => {
    switch (step) {
      case 1: // Energy
        return (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-12">
              {questions.energy}
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { value: "low" as EnergyLevel, label: "Low" },
                { value: "okay" as EnergyLevel, label: "Okay" },
                { value: "high" as EnergyLevel, label: "High" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleEnergySelect(option.value)}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200",
                    "bg-card/30 border border-border/30 hover:bg-card/50 hover:border-primary/30",
                    energy === option.value &&
                      "bg-primary/10 border-primary/50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 2: // Pressure
        return (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-12">
              {questions.pressure}
            </h2>
            <div className="flex flex-col gap-3">
              {[
                {
                  value: "push" as PressurePreference,
                  label: "Push me",
                  desc: "Short, direct, no reassurance",
                },
                {
                  value: "steady" as PressurePreference,
                  label: "Keep me steady",
                  desc: "Neutral, grounded",
                },
                {
                  value: "support" as PressurePreference,
                  label: "Support me",
                  desc: "Gentle, affirming",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePressureSelect(option.value)}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl text-left transition-all duration-200",
                    "bg-card/30 border border-border/30 hover:bg-card/50 hover:border-primary/30",
                    pressure === option.value &&
                      "bg-primary/10 border-primary/50",
                  )}
                >
                  <span className="block text-lg font-medium">
                    {option.label}
                  </span>
                  <span className="block text-sm text-muted-foreground mt-1">
                    {option.desc}
                  </span>
                </button>
              ))}
            </div>
            <Button
              onClick={handlePressureContinue}
              className="mt-8 px-8"
              size="lg"
            >
              Continue
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        );

      case 3: // Intent
        return (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              {questions.intent}
            </h2>
            <p className="text-muted-foreground/60 mb-8">
              Optional, but helps you focus
            </p>
            <Input
              type="text"
              placeholder="Just one thing."
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="text-center text-lg py-6 bg-card/30 border-border/30 focus-visible:ring-primary"
              maxLength={100}
              autoFocus
            />
            <div className="flex flex-col gap-3 mt-8">
              <Button
                onClick={handleIntentSubmit}
                className="px-8"
                size="lg"
                disabled={!intent.trim()}
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <button
                onClick={handleSkipIntent}
                className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                tabIndex={-1}
              >
                Skip for now
              </button>
            </div>
          </div>
        );

      case 5: // Rating (Feedback) - Only visible if showRating is true
        return (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              How is your experience so far?
            </h2>
            <p className="text-muted-foreground/60 mb-8">
              Your feedback helps us improve everyone's focus.
            </p>

            <div className="flex justify-center gap-4 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      rating >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30",
                    )}
                  />
                </button>
              ))}
            </div>

            <Button
              onClick={handleRatingSubmit}
              className="px-8"
              size="lg"
              disabled={rating === 0}
            >
              Submit Rating
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            {/* <button
              onClick={() => setStep(4)}
              className="block w-full text-center mt-4 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Skip
            </button> */}
          </div>
        );

      case 4: // Final
        return (
          <div className="animate-fade-in text-center">
            <p className="text-2xl md:text-3xl font-medium text-foreground mb-2">
              Alright.
            </p>
            <p className="text-2xl md:text-3xl font-medium text-muted-foreground mb-12">
              Let's work.
            </p>
            <Button
              onClick={handleFinalEnter}
              size="lg"
              className="px-12 py-6 text-base font-medium"
            >
              Enter work mode
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {renderStep()}

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                step > i ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreWorkOnboarding;
