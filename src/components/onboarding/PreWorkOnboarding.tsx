import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

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

const PreWorkOnboarding = ({ onComplete }: PreWorkOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [pressure, setPressure] = useState<PressurePreference>("steady");
  const [intent, setIntent] = useState("");

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
    setStep(4);
  };

  const handleIntentSubmit = () => {
    setStep(4);
  };

  const handleFinalEnter = () => {
    onComplete({
      energy: energy || "okay",
      pressure,
      intent,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Step 1: Energy Check */}
        {step === 1 && (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-12">
              How's your energy right now?
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
                    energy === option.value && "bg-primary/10 border-primary/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-12">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-muted" />
              <div className="w-2 h-2 rounded-full bg-muted" />
            </div>
          </div>
        )}

        {/* Step 2: Pressure Preference */}
        {step === 2 && (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-12">
              How should focuu work with you today?
            </h2>
            
            <div className="flex flex-col gap-3">
              {[
                { value: "push" as PressurePreference, label: "Push me", desc: "Short, direct, no reassurance" },
                { value: "steady" as PressurePreference, label: "Keep me steady", desc: "Neutral, grounded" },
                { value: "support" as PressurePreference, label: "Support me", desc: "Gentle, affirming" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePressureSelect(option.value)}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl text-left transition-all duration-200",
                    "bg-card/30 border border-border/30 hover:bg-card/50 hover:border-primary/30",
                    pressure === option.value && "bg-primary/10 border-primary/50"
                  )}
                >
                  <span className="block text-lg font-medium">{option.label}</span>
                  <span className="block text-sm text-muted-foreground mt-1">{option.desc}</span>
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

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-muted" />
            </div>
          </div>
        )}

        {/* Step 3: Focus Intent */}
        {step === 3 && (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              What's the one thing you want to work on first?
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
              >
                Skip for now
              </button>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>
        )}

        {/* Final Confirmation */}
        {step === 4 && (
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
        )}
      </div>
    </div>
  );
};

export default PreWorkOnboarding;
