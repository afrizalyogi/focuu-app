interface SessionTimerDisplayProps {
  formattedTime: string;
  isRunning: boolean;
  progress: number;
}

const SessionTimerDisplay = ({ formattedTime, isRunning, progress }: SessionTimerDisplayProps) => {
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

      {/* Progress bar - subtle */}
      <div className="w-48 h-0.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary/60 transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Status text - calm, observational per PRD */}
      <p className="text-sm text-muted-foreground">
        {isRunning ? "You're here. Take your time." : "Ready when you are."}
      </p>
    </div>
  );
};

export default SessionTimerDisplay;
