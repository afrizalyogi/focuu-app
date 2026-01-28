import { cn } from "@/lib/utils";
import { Timer, Clock } from "lucide-react";

export type TimerMode = "pomodoro" | "flexible";

interface TimerModeSelectorProps {
  selected: TimerMode;
  onSelect: (mode: TimerMode) => void;
}

const TimerModeSelector = ({ selected, onSelect }: TimerModeSelectorProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 p-1 rounded-xl bg-secondary/30 border border-border/30">
        <button
          onClick={() => onSelect("pomodoro")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
            selected === "pomodoro"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <Timer className="w-4 h-4" />
          <span>Pomodoro</span>
        </button>
        <button
          onClick={() => onSelect("flexible")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
            selected === "flexible"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <Clock className="w-4 h-4" />
          <span>Flexible</span>
        </button>
      </div>
    </div>
  );
};

export default TimerModeSelector;