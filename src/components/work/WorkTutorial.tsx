import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Palette,
  Music,
  Image as ImageIcon,
  MessageSquare,
  CheckSquare,
  Clock,
  Play,
  MonitorPlay,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkTutorialProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to your Workspace",
    description:
      "This is your focused environment. Let's customize it to fit your workflow.",
    icon: MonitorPlay,
    position: "center",
  },
  {
    title: "Customize Theme",
    description:
      "Choose a visual theme that suits your mood. Dark, Light, or something colorful.",
    icon: Palette,
    targetId: "dock-theme",
    position: "bottom", // Points to dock
  },
  {
    title: "Focus Music",
    description:
      "Play lo-fi capability or link your own music to stay in the zone.",
    icon: Music,
    targetId: "dock-music",
    position: "bottom",
  },
  {
    title: "Background Ambience",
    description: "Set a calming video or image background to immerse yourself.",
    icon: ImageIcon,
    targetId: "dock-background",
    position: "bottom",
  },
  {
    title: "Live Chat",
    description: "Connect with other focused users for accountability.",
    icon: MessageSquare,
    targetId: "dock-chat",
    position: "bottom",
  },
  {
    title: "Focus Tasks",
    description:
      "Manage your session tasks here. Keep it simple and actionable.",
    icon: CheckSquare,
    targetId: "dock-tasks",
    position: "bottom",
  },
  {
    title: "Timer Mode",
    description: "Choose between Flexible (Stopwatch) or Pomodoro technique.",
    icon: Clock,
    targetId: "work-timer-mode",
    position: "start", // Near timer selector
  },
  {
    title: "Start Session",
    description:
      "When you're ready, hit Start to begin tracking your focus journey.",
    icon: Play,
    targetId: "work-start-button",
    position: "start", // Near start button
  },
];

const WorkTutorial = ({ onComplete }: WorkTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightStyle, setHighlightStyle] =
    useState<React.CSSProperties | null>(null);

  const step = STEPS[currentStep];

  useEffect(() => {
    // Small delay to appear smoothly
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate highlight position
  useEffect(() => {
    if (!step.targetId) {
      setHighlightStyle(null);
      return;
    }

    const updatePosition = () => {
      const el = document.getElementById(step.targetId as string);
      if (el) {
        const rect = el.getBoundingClientRect();
        setHighlightStyle({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    // Also update on scroll just in case, though page is mostly fixed
    window.addEventListener("scroll", updatePosition);

    // Slight delay for ensuring element is rendered/positioned
    setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, step.targetId]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300); // Wait for animation
  };

  // Dynamic positioning logic for the popup
  // We avoid covering the highlight by checking its vertical position
  const getPopupStyle = (): React.CSSProperties => {
    if (!highlightStyle) {
      // Center if no highlight
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const viewportHeight = window.innerHeight;
    const targetCenterY = highlightStyle.top
      ? (typeof highlightStyle.top === "number" ? highlightStyle.top : 0) +
        (typeof highlightStyle.height === "number"
          ? highlightStyle.height
          : 0) /
          2
      : viewportHeight / 2;

    // Gap between highlight and popup
    const gap = 20;

    // If target is in top half, show popup below | If in bottom half, show above
    // Assuming popup height ~200px.
    if (targetCenterY < viewportHeight / 2) {
      // Position Below
      return {
        top:
          (highlightStyle.top as number) +
          (highlightStyle.height as number) +
          gap,
        left: "50%",
        transform: "translateX(-50%)",
      };
    } else {
      // Position Above
      return {
        bottom: viewportHeight - (highlightStyle.top as number) + gap,
        left: "50%",
        transform: "translateX(-50%)",
      };
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      {/* Global Backdrop (Fallback for when no target is highlighted) */}
      {!highlightStyle && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      )}

      {/* Highlight Box with "Hole" Overlay */}
      {highlightStyle && (
        <div
          className="absolute border-2 border-primary/50 rounded-xl transition-all duration-300 ease-out z-[61] pointer-events-none"
          style={{
            ...highlightStyle,
            // The magic: giant shadow creates the backdrop
            boxShadow:
              "0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 30px rgba(var(--primary-rgb), 0.3)",
          }}
        >
          {/* Inner Glow */}
          <div className="absolute -inset-1 bg-primary/10 rounded-xl animate-pulse" />
        </div>
      )}

      <div
        className={cn(
          "absolute transition-all duration-500 ease-out max-w-sm w-full z-[62]",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
        style={getPopupStyle()}
      >
        <Card className="border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <CardHeader className="pt-8 pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <step.icon className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(
                currentStep === 0 && "opacity-0 pointer-events-none",
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i === currentStep ? "bg-primary" : "bg-primary/20",
                  )}
                />
              ))}
            </div>

            <Button size="sm" onClick={handleNext}>
              {currentStep === STEPS.length - 1 ? "Get Started" : "Next"}
              {currentStep !== STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WorkTutorial;
