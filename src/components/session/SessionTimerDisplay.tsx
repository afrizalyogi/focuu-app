import { TimerType } from "@/hooks/useSessionTimer";

interface SessionTimerDisplayProps {
  formattedTime: string;
  isRunning: boolean;
  progress: number;
  timerType?: TimerType;
  isOnBreak?: boolean;
}

const SessionTimerDisplay = ({ 
  formattedTime, 
  isRunning, 
  progress,
  timerType = "countdown",
  isOnBreak = false
}: SessionTimerDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Timer display */}
      <div className="relative">
        <div 
          className={`
            text-7xl md:text-8xl font-medium tracking-tight text-foreground 
            tabular-nums transition-calm
            ${isRunning ? "animate-breathe" : ""}
          `}
        >
          {formattedTime}
        </div>
      </div>

      {/* Progress bar - only for countdown mode */}
      {timerType === "countdown" && (
        <div className="w-48 h-0.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary/60 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* For stopwatch - show subtle dot indicator only */}
      {timerType === "stopwatch" && (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-muted-foreground/50"}`} />
        </div>
      )}

      {/* Status text - calm, observational per PRD */}
      <p className="text-sm text-muted-foreground">
        {isOnBreak 
          ? "Take a moment. Breathe." 
          : isRunning 
            ? "You're here. Take your time." 
            : "Ready when you are."}
      </p>
    </div>
  );
};

export default SessionTimerDisplay;
