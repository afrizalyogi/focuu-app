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

const MOODS = [
  {
    id: "focused",
    label: "Focused",
    emoji: "🎯",
    desc: "Ready to crush it.",
    config: { energy: "high", pressure: "push", minutes: 50 },
  },
  {
    id: "stressed",
    label: "Stressed",
    emoji: "🤯",
    desc: "Ovewhelmed, need order.",
    config: { energy: "okay", pressure: "steady", minutes: 25 },
  },
  {
    id: "tired",
    label: "Tired",
    emoji: "😴",
    desc: "Low energy, easy start.",
    config: { energy: "low", pressure: "support", minutes: 15 },
  },
  {
    id: "creative",
    label: "Creative",
    emoji: "✨",
    desc: "Flow state seeking.",
    config: { energy: "high", pressure: "steady", minutes: 90 },
  },
];

const PreWorkOnboarding = ({ onComplete }: PreWorkOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    // Proceed to complete
    const mood = MOODS.find((m) => m.id === moodId);
    if (mood) {
      // Just auto complete after selection for seamless entry
      // Or show a simple "Let's go" confirmation?
      // User prefers interactive but fast.
      onComplete({
        energy: mood.config.energy as EnergyLevel,
        pressure: mood.config.pressure as PressurePreference,
        intent: "", // Intent skipped or can be asked in Work page task later
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            How are you currently feeling?
          </h2>
          <p className="text-muted-foreground text-lg">
            We'll adapt the session to you.
          </p>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className="group relative flex flex-col items-center justify-center p-8 rounded-3xl bg-card border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <span className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                {mood.emoji}
              </span>
              <h3 className="text-xl font-bold mb-1">{mood.label}</h3>
              <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                {mood.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreWorkOnboarding;
